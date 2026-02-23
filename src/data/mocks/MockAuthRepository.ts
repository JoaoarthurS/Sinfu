/**
 * Exemplo de Mock para testes
 * Demonstra como testar componentes com dependências
 */

import { IAuthRepository } from '../../domain/interfaces/IAuthRepository';
import { AuthCredentials, AuthResponse, User, UserRole } from '../../domain/entities/User';

export class MockAuthRepository implements IAuthRepository {
  private mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  private mockToken = 'mock-jwt-token';

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    // Simula delay de rede
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

    if (credentials.email === 'admin@example.com') {
      return {
        user: { ...this.mockUser, role: UserRole.ADMIN },
        token: this.mockToken,
      };
    }

    return {
      user: this.mockUser,
      token: this.mockToken,
    };
  }

  async logout(): Promise<void> {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 200));
  }

  async getCurrentUser(): Promise<User | null> {
    return this.mockUser;
  }

  async validateToken(token: string): Promise<boolean> {
    return token === this.mockToken;
  }
}
