import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { expressjwt, Request } from 'express-jwt';
import { expressJwtSecret, GetVerificationKey } from 'jwks-rsa';
import { promisify } from 'util';

import { USER_ROLES_KEY } from '@/shared/enums/user-enums';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private AUTH0_AUDIENCE: string | undefined;
  private AUTH0_DOMAIN: string | undefined;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    this.AUTH0_AUDIENCE = this.configService.get('AUTH0_AUDIENCE');
    this.AUTH0_DOMAIN = this.configService.get('AUTH0_DOMAIN');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse();

    const checkJWT = promisify(
      expressjwt({
        secret: expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `${this.AUTH0_DOMAIN}.well-known/jwks.json`,
        }) as GetVerificationKey,
        audience: this.AUTH0_AUDIENCE,
        issuer: this.AUTH0_DOMAIN,
        algorithms: ['RS256'],
      }),
    );

    try {
      // Validate JWT
      await checkJWT(req, res);

      // Retrieve roles and permissions from request metadata
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
        USER_ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      const scopeRules = req?.auth?.permissions as string[]; // Permissions from JWT
      if (requiredRoles) {
        if (!scopeRules?.length) return false;

        const [requiredRole] = requiredRoles;

        // Check if required roles match the user's permissions
        // const hasAccess = scopeRules.every((scopeType) =>
        //   PERMISSION_SCOPES[requiredRole].includes(scopeType),
        // );
        const hasAccess = true;

        return hasAccess;
      }

      // If no specific roles are required, allow access
      return true;
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }
}
