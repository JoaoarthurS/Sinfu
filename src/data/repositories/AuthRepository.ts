/**
 * Implementação do Repositório de Autenticação
 * Princípio SOLID: SRP - Responsável apenas pela lógica de autenticação
 * Princípio SOLID: DIP - Depende de abstrações (IApiClient, IStorageService)
 */
import { IAuthRepository } from '../../domain/interfaces/IAuthRepository';
import { IApiClient } from '../../domain/interfaces/IApiClient';
import { IStorageService } from '../../domain/interfaces/IStorageService';
import { AuthCredentials, AuthResponse, RegisterData, User, UserRole } from '../../domain/entities/User';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../config/api.config';
import { fixImageUrl } from '../../core/utils/fixImageUrl';

export class AuthRepository implements IAuthRepository {
  constructor(
    private apiClient: IApiClient,
    private storageService: IStorageService
  ) {}

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post<any>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      const { token, user: apiUser } = response.data;

      // Mapear resposta da API para entidade User
      // A API retorna 'roles' (array), mas nosso app usa 'role' (string)
      const user: User = {
        id: apiUser.id.toString(),
        name: apiUser.name,
        email: apiUser.email,
        role: this.mapRoleFromApi(apiUser.roles),
        profileImage: apiUser.profile_image,
        profileImageUrl: fixImageUrl(apiUser.profile_image_url),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Salvar token e dados do usuário
      await this.storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await this.storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      // Configurar token no cliente API
      this.apiClient.setAuthToken(token);

      return { token, user };
    } catch (error) {
      console.error('Login error:', {
        endpoint: API_ENDPOINTS.AUTH.LOGIN,
        error
      });
      throw error;
    }
  }

  async register(data: RegisterData): Promise<void> {
    try {
      await this.apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password,
        ...(data.group_ids && data.group_ids.length > 0 ? { group_ids: data.group_ids } : {}),
      });
    } catch (error) {
      console.error('Register error:', {
        endpoint: API_ENDPOINTS.AUTH.REGISTER,
        error,
      });
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await this.apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    } catch (error) {
      console.error('Forgot password error:', {
        endpoint: API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        error,
      });
      throw error;
    }
  }

  /**
   * Mapeia o array de roles da API para um único valor de role
   * Se o usuário tem a role 'admin', retorna ADMIN, caso contrário USER
   */
  private mapRoleFromApi(roles: string[]): UserRole {
    return roles && roles.includes('admin') ? UserRole.ADMIN : UserRole.USER;
  }

  async logout(): Promise<void> {
    try {
      // Tentar fazer logout no servidor
      await this.apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Sempre limpar dados locais
      await this.storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await this.storageService.removeItem(STORAGE_KEYS.USER_DATA);
      await this.storageService.removeItem(STORAGE_KEYS.AUTH_PORTAL);
      this.apiClient.removeAuthToken();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await this.storageService.getItem(STORAGE_KEYS.USER_DATA);
      if (!userData) {
        return null;
      }

      const user = JSON.parse(userData) as User;
      
      // Converter strings de data para objetos Date
      return {
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    this.apiClient.setAuthToken(token);
    try {
      await this.apiClient.get(API_ENDPOINTS.AUTH.ME);
      return true;
    } catch (error: any) {
      // Só considera o token inválido quando o servidor o rejeita
      // explicitamente (401/403). Falha de rede, timeout ou erro do
      // servidor não podem apagar a sessão salva do usuário.
      const status = error?.status;
      if (status === 401 || status === 403) {
        return false;
      }
      console.error('Validate token error (sessão mantida):', error);
      return true;
    }
  }
}
