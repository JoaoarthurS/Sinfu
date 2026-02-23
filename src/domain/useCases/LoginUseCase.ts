/**
 * Use Case de Login
 * Princípio SOLID: SRP - Responsável apenas pela lógica de caso de uso de login
 * Princípio SOLID: DIP - Depende da abstração IAuthRepository
 */
import { IAuthRepository } from '../../domain/interfaces/IAuthRepository';
import { AuthCredentials, AuthResponse } from '../../domain/entities/User';

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(credentials: AuthCredentials): Promise<AuthResponse> {
    // Validações podem ser adicionadas aqui
    if (!credentials.email || !credentials.password) {
      throw new Error('Email e senha são obrigatórios');
    }

    if (!this.isValidEmail(credentials.email)) {
      throw new Error('Email inválido');
    }

    return await this.authRepository.login(credentials);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
