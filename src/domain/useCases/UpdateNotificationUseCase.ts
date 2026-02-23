/**
 * Use Case - Atualizar notificação
 * Princípio SOLID: SRP - Responsável apenas pela lógica de atualização
 */
import { INotificationRepository } from '../../domain/interfaces/INotificationRepository';
import { Notification, UpdateNotificationDTO } from '../../domain/entities/Notification';

export class UpdateNotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(data: UpdateNotificationDTO): Promise<Notification> {
    // Validações
    if (data.title && data.title.trim().length === 0) {
      throw new Error('Título não pode ser vazio');
    }

    if (data.message && data.message.trim().length === 0) {
      throw new Error('Mensagem não pode ser vazia');
    }

    if (data.title && data.title.length > 100) {
      throw new Error('Título deve ter no máximo 100 caracteres');
    }

    if (data.message && data.message.length > 500) {
      throw new Error('Mensagem deve ter no máximo 500 caracteres');
    }

    return await this.notificationRepository.update(data);
  }
}
