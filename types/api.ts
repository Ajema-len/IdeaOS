export type ApiResponse<T> = {
  data: T;
  error?: never;
} | {
  data?: never;
  error: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type IdeaFilters = {
  status?: string;
  category?: string;
  tags?: string;
  search?: string;
  sort?: "momentumScore" | "lastWorkedAt" | "createdAt" | "title";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
};
