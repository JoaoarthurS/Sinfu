/**
 * Interface do Repositório de Notificações
 * Princípio SOLID: DIP (Dependency Inversion Principle)
 */
import { Notification, CreateNotificationDTO, UpdateNotificationDTO } from '../entities/Notification';

export interface INotificationRepository {
  getAll(): Promise<Notification[]>;
  getById(id: string): Promise<Notification | null>;
  create(notification: CreateNotificationDTO): Promise<Notification>;
  update(notification: UpdateNotificationDTO): Promise<Notification>;
  delete(id: string): Promise<void>;
  markAsRead(id: string): Promise<void>;
}
