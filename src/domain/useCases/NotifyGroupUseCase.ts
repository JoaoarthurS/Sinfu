/**
 * Use Case - Notificar grupo
 * Princípio SOLID: SRP - Responsável apenas pela lógica de notificação de grupos
 */
import { IGroupRepository } from '../interfaces/IGroupRepository';
import { NotifyGroupDTO } from '../entities/Group';

export class NotifyGroupUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(data: NotifyGroupDTO): Promise<{ message: string; users_count: number; tokens_count: number }> {
    // Validações
    if (!data.groupId || data.groupId.trim().length === 0) {
      throw new Error('ID do grupo é obrigatório');
    }

    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Título é obrigatório');
    }

    if (!data.body || data.body.trim().length === 0) {
      throw new Error('Mensagem é obrigatória');
    }

    if (data.title.length > 100) {
      throw new Error('Título deve ter no máximo 100 caracteres');
    }

    if (data.body.length > 500) {
      throw new Error('Mensagem deve ter no máximo 500 caracteres');
    }

    return await this.groupRepository.notifyGroup(data);
  }
}
