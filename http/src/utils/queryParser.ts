import { PostQuery, PaginationParams, PostFilters, SortParams } from '../types/PostQuery';

export function parsePostQuery(query: any): PostQuery {
  const pagination = parsePagination(query);
  const filters = parseFilters(query);
  const sort = parseSort(query);

  return {
    pagination,
    filters,
    sort
  };
}

function parsePagination(query: any): PaginationParams {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));

  return { page, limit };
}

function parseFilters(query: any): PostFilters | undefined {
  const filters: PostFilters = {};
  let hasFilters = false;

  if (query.source_channel) {
    filters.source_channel = query.source_channel;
    hasFilters = true;
  }

  if (query.text) {
    filters.text = query.text;
    hasFilters = true;
  }

  if (query.is_unique !== undefined) {
    filters.is_unique = query.is_unique === 'true' || query.is_unique === true;
    hasFilters = true;
  }

  if (query.date_from) {
    const dateFrom = new Date(query.date_from);
    if (!isNaN(dateFrom.getTime())) {
      filters.date_from = dateFrom;
      hasFilters = true;
    }
  }

  if (query.date_to) {
    const dateTo = new Date(query.date_to);
    if (!isNaN(dateTo.getTime())) {
      filters.date_to = dateTo;
      hasFilters = true;
    }
  }

  return hasFilters ? filters : undefined;
}

function parseSort(query: any): SortParams | undefined {
  if (!query.sort_field) {
    return undefined;
  }

  const validFields = ['timestamp', 'created_at', 'source_channel'];
  const field = validFields.includes(query.sort_field) ? query.sort_field : 'created_at';
  const order = query.sort_order === 'asc' ? 'asc' : 'desc';

  return { field, order };
} 