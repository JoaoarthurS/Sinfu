/**
 * Cliente HTTP usando Axios
 * Princípio SOLID: DIP - Implementa a interface IApiClient
 * Princípio SOLID: OCP - Aberto para extensão através de interceptors
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { 
  IApiClient, 
  ApiResponse, 
  ApiError, 
  RequestConfig 
} from '../../domain/interfaces/IApiClient';
import { API_CONFIG } from '../../config/api.config';
import { Alert } from 'react-native';

export class AxiosApiClient implements IApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        console.error('❌ Response Error:', {
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          status: error.response?.status,
          message: error.message
        });
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    const url = error.config?.url || 'URL desconhecida';
    const method = error.config?.method?.toUpperCase() || 'MÉTODO desconhecido';
    
    if (error.response) {
      // Servidor respondeu com status code fora do range 2xx
      return {
        message: (error.response.data as any)?.message || 'Erro no servidor',
        status: error.response.status,
        errors: (error.response.data as any)?.errors,
      };
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta
      console.error(`📍 Rota sem resposta: ${method} ${url}`);
      return {
        message: `Sem resposta do servidor. Verifique sua conexão. Rota: ${method} ${url}`,
        status: 0,
      };
    } else {
      // Erro na configuração da requisição
      console.error(`📍 Erro na configuração: ${method} ${url}`);
      return {
        message: error.message || 'Erro desconhecido',
        status: 0,
      };
    }
  }

  private mapConfig(config?: RequestConfig): AxiosRequestConfig {
    return {
      headers: config?.headers,
      params: config?.params,
    };
  }

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<T>(url, this.mapConfig(config));
    return {
      data: response.data,
      status: response.status,
    };
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, data, this.mapConfig(config));
    return {
      data: response.data,
      status: response.status,
    };
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, data, this.mapConfig(config));
    return {
      data: response.data,
      status: response.status,
    };
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url, this.mapConfig(config));
    return {
      data: response.data,
      status: response.status,
    };
  }

  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }
}
