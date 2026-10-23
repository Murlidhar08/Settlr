export type {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "@/lib/api/response";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
