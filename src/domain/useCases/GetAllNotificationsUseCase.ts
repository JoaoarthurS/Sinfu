/**
 * Use Case - Listar todas as notificações
 * Princípio SOLID: SRP - Responsável apenas pela lógica de listagem
 */
import { INotificationRepository } from '../../domain/interfaces/INotificationRepository';
import { Notification } from '../../domain/entities/Notification';

export class GetAllNotificationsUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(): Promise<Notification[]> {
    return await this.notificationRepository.getAll();
  }
}
