

export type AppRequest<T> = ({
  success: true,
  data: T,
} | {
  success: false
  error: string,
}) & {
  message?: string,
  timestamp: string,
  path: string,
}


export type PaginatedResponse<T> = {
  docs: T[],
  totalDocs: number,
  limit: 10,
  totalPages: 1,
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null
}

export type PaginatedRequest<T> = AppRequest<PaginatedResponse<T>>