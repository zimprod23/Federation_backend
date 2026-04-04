export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export class ApiResponseBuilder {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): ApiResponse<PaginatedData<T>> {
    return {
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }

  static error(error: string, details?: unknown): ApiResponse<never> {
    return {
      success: false,
      error,
      data: details as never,
      timestamp: new Date().toISOString(),
    };
  }
}
