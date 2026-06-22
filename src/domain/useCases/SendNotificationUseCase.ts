/**
 * Use Case - Enviar (disparar) uma notificação já criada
 * Princípio SOLID: SRP - Responsável apenas por acionar o envio
 */
import { INotificationRepository } from '../../domain/interfaces/INotificationRepository';

export class SendNotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(id: string): Promise<{ usersCount: number; tokensCount: number }> {
    if (!id) {
      throw new Error('ID da notificação é obrigatório');
    }

    return await this.notificationRepository.send(id);
  }
}
