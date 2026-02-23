/**
 * Use Case - Criar grupo
 * Princípio SOLID: SRP - Responsável apenas pela lógica de criação
 */
import { IGroupRepository } from '../interfaces/IGroupRepository';
import { Group, CreateGroupDTO } from '../entities/Group';

export class CreateGroupUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(data: CreateGroupDTO): Promise<Group> {
    // Validações
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }

    if (data.name.length > 255) {
      throw new Error('Nome deve ter no máximo 255 caracteres');
    }

    return await this.groupRepository.create(data);
  }
}
