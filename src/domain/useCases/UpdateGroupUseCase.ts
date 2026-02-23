/**
 * Use Case - Atualizar grupo
 * Princípio SOLID: SRP - Responsável apenas pela lógica de atualização
 */
import { IGroupRepository } from '../interfaces/IGroupRepository';
import { Group, UpdateGroupDTO } from '../entities/Group';

export class UpdateGroupUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(data: UpdateGroupDTO): Promise<Group> {
    if (data.name && data.name.length > 255) {
      throw new Error('Nome deve ter no máximo 255 caracteres');
    }

    return await this.groupRepository.update(data);
  }
}
