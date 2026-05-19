/**
 * Use Case - Deletar notificação
 * Princípio SOLID: SRP - Responsável apenas pela lógica de exclusão
 */
import { INotificationRepository } from '../../domain/interfaces/INotificationRepository';

export class DeleteNotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(id: string): Promise<void> {
    console.log('🎯 [DeleteNotificationUseCase] execute chamado com id:', id);
    
    if (!id || id.trim().length === 0) {
      throw new Error('ID da notificação é obrigatório');
    }

    console.log('🎯 [DeleteNotificationUseCase] chamando repository.delete');
    await this.notificationRepository.delete(id);
    console.log('🎯 [DeleteNotificationUseCase] repository.delete concluído');
  }
}
