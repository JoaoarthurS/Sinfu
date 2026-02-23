/**
 * Use Case de Logout
 * Princípio SOLID: SRP - Responsável apenas pela lógica de caso de uso de logout
 */
import { IAuthRepository } from '../../domain/interfaces/IAuthRepository';

export class LogoutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.logout();
  }
}
