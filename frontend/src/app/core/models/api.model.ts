export interface ApiResource<T> {
  data: T;
}

export interface PaginationMeta {
  page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export type ValidationErrors = Record<string, string[]>;
