/**
 * Use Case - Criar notificação
 * Princípio SOLID: SRP - Responsável apenas pela lógica de criação
 */
import { INotificationRepository } from '../../domain/interfaces/INotificationRepository';
import { Notification, CreateNotificationDTO } from '../../domain/entities/Notification';

export class CreateNotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(data: CreateNotificationDTO): Promise<Notification> {
    // Validações
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Título é obrigatório');
    }

    if (!data.message || data.message.trim().length === 0) {
      throw new Error('Mensagem é obrigatória');
    }

    if (data.title.length > 100) {
      throw new Error('Título deve ter no máximo 100 caracteres');
    }

    if (data.message.length > 500) {
      throw new Error('Mensagem deve ter no máximo 500 caracteres');
    }

    return await this.notificationRepository.create(data);
  }
}
