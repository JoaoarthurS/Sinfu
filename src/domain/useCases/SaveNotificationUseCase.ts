/**
 * Use Case: Salvar Notificação
 * Princípio SOLID: SRP - Responsável apenas por salvar notificações
 */
import { INotificationRepository } from '../../domain/interfaces/INotificationRepository';

export class SaveNotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(notificationId: string): Promise<void> {
    return this.notificationRepository.saveNotification(notificationId);
  }
}
