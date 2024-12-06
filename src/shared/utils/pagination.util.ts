export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function paginate<T>(
  model: any,
  params: PaginationParams,
  options: { include?: any; orderBy?: any; where?: any } = {},
): Promise<PaginatedResult<T>> {
  const { page = 1, limit = 10 } = params;

  const take = Math.max(limit, 1);
  const skip = (Math.max(page, 1) - 1) * take;

  const total = await model.count({
    where: options.where,
  });

  const data = await model.findMany({
    take,
    skip,
    orderBy: options.orderBy || { createdAt: 'desc' },
    include: options.include,
    where: options.where,
  });

  const totalPages = Math.ceil(total / take);

  return {
    data,
    total,
    totalPages,
    currentPage: page,
  };
}
