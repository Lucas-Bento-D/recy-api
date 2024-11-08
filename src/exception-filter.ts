import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { ulid } from 'ulid';
import { ZodError, ZodIssue } from 'zod';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, details } = this.getResponseMetadata(exception);
    const responseBody = this.buildResponseBody(
      status,
      request,
      message,
      details,
      exception,
    );

    response.status(status).json(responseBody);
  }

  private buildResponseBody(
    status: number,
    request: Request,
    message: string | object,
    details: ErrorDetails | null,
    exception: unknown,
  ): ErrorDto {
    const responseBody = this.buildBaseResponseBody(
      status,
      request,
      message,
      details,
    );
    if (status !== HttpStatus.INTERNAL_SERVER_ERROR) {
      return typeof message === 'object'
        ? { ...responseBody, ...message }
        : responseBody;
    }

    return this.build500Error(exception, responseBody);
  }

  private build500Error(exception: unknown, responseBody: ErrorDto): ErrorDto {
    const errorId = this.generateErrorId();
    this.logger.error(
      {
        errorId,
        err: exception,
      },
      `Unexpected exception thrown`,
      'ExceptionFilter',
    );

    return { ...responseBody, errorId };
  }

  private buildBaseResponseBody(
    status: number,
    request: Request,
    message: string | object,
    details: ErrorDetails | null,
  ): ErrorDto {
    return {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      details,
    };
  }

  private getResponseMetadata(exception: unknown): ResponseMetadata {
    console.log(exception);
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object =
      'Internal server error, contact support and provide the errorId';
    let details: ErrorDetails | null = null;

    if (exception instanceof ZodError) {
      return this.handleZodError(exception);
    }
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception);
    }
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseMessage = exception.getResponse();

      if (
        exception instanceof BadRequestException &&
        typeof responseMessage === 'object'
      ) {
        message = (responseMessage as { message: string }).message;
        details =
          (responseMessage as { details?: ErrorDetails }).details || null;
      } else {
        message = responseMessage;
      }

      return { status, message, details };
    }

    return { status, message, details };
  }

  private generateErrorId(): string {
    return ulid();
  }

  private handleZodError(exception: ZodError): ResponseMetadata {
    const status = HttpStatus.BAD_REQUEST;
    const message = {
      errors: exception.errors.map((err: ZodIssue) => ({
        message: err.message,
        path: err.path,
      })),
    };
    return { status, message, details: null };
  }

  private handlePrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): ResponseMetadata {
    let status = HttpStatus.BAD_REQUEST;
    let message = 'Database error occurred';

    if (exception.code === 'P2002') {
      message = `Unique constraint failed on the field: ${exception.meta?.target}`;
    } else if (exception.code === 'P2003') {
      message = `Foreign key constraint failed on the field: ${exception.meta?.field_name}`;
    } else if (exception.code === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      message = 'Record not found for the specified operation.';
    }

    return { status, message, details: null };
  }
}

export interface ErrorDto {
  statusCode: number;
  timestamp: string;
  errorId?: string;
  path: string;
  message: string | object;
  details?: ErrorDetails | null;
}

type ErrorDetails = Record<string, unknown> | null;

interface ResponseMetadata {
  status: number;
  message: string | object;
  details: ErrorDetails;
}
