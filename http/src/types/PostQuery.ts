export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PostFilters {
  source_channel?: string;
  text?: string;
  is_unique?: boolean;
  date_from?: Date;
  date_to?: Date;
}

export interface SortParams {
  field: 'timestamp' | 'created_at' | 'source_channel';
  order: 'asc' | 'desc';
}

export interface PostQuery {
  pagination: PaginationParams;
  filters?: PostFilters;
  sort?: SortParams;
}

export interface PaginatedResponse<T> {
  data: T[];
  params: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} 