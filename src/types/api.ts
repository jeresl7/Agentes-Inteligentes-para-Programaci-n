export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppointmentQueryParams {
  start_date?: string;
  end_date?: string;
  provider_id?: number;
  status?: string;
  page?: number;
  limit?: number;
}
