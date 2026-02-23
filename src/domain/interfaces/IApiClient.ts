/**
 * Interface do Cliente API
 * Princípio SOLID: DIP (Dependency Inversion Principle)
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface IApiClient {
  get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  setAuthToken(token: string): void;
  removeAuthToken(): void;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}
