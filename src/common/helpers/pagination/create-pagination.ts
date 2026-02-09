import { PaginatedResult, PaginationParams } from './pagination.types';

export function createPagination<T>(
  items: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> {
  const { page, limit } = params;
  const pages = Math.ceil(total / limit) || 1;

  return {
    items,
    meta: {
      total,
      page,
      limit,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };
}
