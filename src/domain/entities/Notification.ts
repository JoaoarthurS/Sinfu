/**
 * Notification Entity - Representa uma notificação no sistema
 * Princípio SOLID: SRP (Single Responsibility Principle)
 */
export enum NotificationPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  saved?: boolean; // Indica se a notificação foi salva pelo usuário
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  link?: string;
  imageUrl?: string;
}

export interface CreateNotificationDTO {
  title: string;
  message: string;
  priority: NotificationPriority;
  userIds?: string[];
  groupIds?: string[];
  link?: string;
  image?: any; // Para upload de arquivo de imagem
}

export interface UpdateNotificationDTO {
  id: string;
  title?: string;
  message?: string;
  priority?: NotificationPriority;
}
