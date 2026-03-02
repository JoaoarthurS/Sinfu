/**
 * Use Case - Obter perfil do usuário
 * Princípio SOLID: SRP - Responsável apenas pela lógica de obtenção de perfil
 */
import { IProfileRepository } from '../interfaces/IProfileRepository';
import { User } from '../entities/User';

export class GetProfileUseCase {
  constructor(private profileRepository: IProfileRepository) {}

  async execute(): Promise<User> {
    return await this.profileRepository.getProfile();
  }
}
