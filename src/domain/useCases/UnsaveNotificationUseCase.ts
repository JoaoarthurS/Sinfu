/**
 * Use Case: Desfazer salvamento de Notificação
 * Princípio SOLID: SRP - Responsável apenas por desfazer salvamento de notificações
 */
import { INotificationRepository } from '../../domain/interfaces/INotificationRepository';

export class UnsaveNotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(notificationId: string): Promise<void> {
    return this.notificationRepository.unsaveNotification(notificationId);
  }
}
