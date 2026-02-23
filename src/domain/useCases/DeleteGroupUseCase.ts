/**
 * Use Case - Deletar grupo
 * Princípio SOLID: SRP - Responsável apenas pela lógica de exclusão
 */
import { IGroupRepository } from '../interfaces/IGroupRepository';

export class DeleteGroupUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(id: string): Promise<void> {
    if (!id || id.trim().length === 0) {
      throw new Error('ID é obrigatório');
    }

    return await this.groupRepository.delete(id);
  }
}
