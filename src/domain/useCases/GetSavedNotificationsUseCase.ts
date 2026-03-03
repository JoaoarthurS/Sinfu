/**
 * Use Case: Obter Notificações Salvas
 * Princípio SOLID: SRP - Responsável apenas por obter notificações salvas
 */
import { Notification } from '../entities/Notification';
import { INotificationRepository } from '../../domain/interfaces/INotificationRepository';

export class GetSavedNotificationsUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(): Promise<Notification[]> {
    return this.notificationRepository.getSavedNotifications();
  }
}
