/**
 * Interface do Repositório de Autenticação
 * Princípio SOLID: DIP (Dependency Inversion Principle)
 * As camadas superiores dependem de abstrações, não de implementações concretas
 */
import { AuthCredentials, AuthResponse, RegisterData, User } from '../entities/User';

export interface IAuthRepository {
  login(credentials: AuthCredentials): Promise<AuthResponse>;
  forgotPassword(email: string): Promise<void>;
  register(data: RegisterData): Promise<void>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  validateToken(token: string): Promise<boolean>;
}
