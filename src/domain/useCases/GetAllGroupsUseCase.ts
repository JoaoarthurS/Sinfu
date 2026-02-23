/**
 * Use Case - Listar todos os grupos
 * Princípio SOLID: SRP - Responsável apenas pela lógica de listagem
 */
import { IGroupRepository } from '../interfaces/IGroupRepository';
import { Group } from '../entities/Group';

export class GetAllGroupsUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(): Promise<Group[]> {
    return await this.groupRepository.getAll();
  }
}
