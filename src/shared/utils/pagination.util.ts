import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.preprocess(
    (val) => parseInt(val as string, 10),
    z.number().int().min(1).optional(),
  ),
  limit: z.preprocess(
    (val) => parseInt(val as string, 10),
    z.number().int().min(1).max(100).optional(),
  ),
});

export type PaginationDto = z.infer<typeof PaginationSchema>;

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
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
  const parsed = PaginationSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error('Invalid pagination parameters');
  }

  const { page = 1, limit = 10 } = parsed.data;

  const skip = (page - 1) * limit;
  const take = limit;

  const [total, data] = await Promise.all([getCount(), getData(skip, take)]);
  const pageCount = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      itemCount: data.length,
      pageCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < pageCount,
    },
  };
}
