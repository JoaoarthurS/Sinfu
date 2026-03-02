/**
 * Use Case - Atualizar perfil do usuário
 * Princípio SOLID: SRP - Responsável apenas pela lógica de atualização de perfil
 */
import { IProfileRepository } from '../interfaces/IProfileRepository';
import { User } from '../entities/User';
import { UpdateProfileDTO } from '../entities/UpdateProfileDTO';

export class UpdateProfileUseCase {
  constructor(private profileRepository: IProfileRepository) {}

  async execute(data: UpdateProfileDTO): Promise<User> {
    // Validações
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Nome não pode estar vazio');
    }

    if (data.name && data.name.length > 255) {
      throw new Error('Nome deve ter no máximo 255 caracteres');
    }

    if (data.email !== undefined && data.email.trim().length === 0) {
      throw new Error('Email não pode estar vazio');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Email inválido');
    }

    if (data.password) {
      if (data.password.length < 6) {
        throw new Error('Senha deve ter no mínimo 6 caracteres');
      }

      if (data.password !== data.password_confirmation) {
        throw new Error('As senhas não conferem');
      }
    }

    return await this.profileRepository.updateProfile(data);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
