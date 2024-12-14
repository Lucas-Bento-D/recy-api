import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export async function paginate<T>(
  getCount: () => Promise<number>,
  getData: (skip: number, take: number) => Promise<T[]>,
  params: PaginationParams,
): Promise<PaginatedResult<T>> {
  const { page = 1, limit = 10 } = params;

  const sanitizedPage = Math.max(page, 1);
  const sanitizedLimit = Math.max(limit, 1);

  const skip = (sanitizedPage - 1) * sanitizedLimit;
  const take = sanitizedLimit;

  try {
    const [total, data] = await Promise.all([getCount(), getData(skip, take)]);
    const totalPages = Math.ceil(total / take);

    return {
      data,
      total,
      totalPages,
      currentPage: sanitizedPage,
    };
  } catch (error) {
    throw new Error(`Pagination failed: ${(error as Error).message}`);
  }
}
