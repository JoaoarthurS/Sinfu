/**
 * Notification Entity - Representa uma notificação no sistema
 * Princípio SOLID: SRP (Single Responsibility Principle)
 */

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  saved?: boolean; // Indica se a notificação foi salva pelo usuário
  status?: string; // 'inactive' (rascunho) | 'sent' (enviada)
  usersCount?: number; // quantidade de destinatários (após envio)
  sentAt?: Date | null; // quando foi enviada (null = ainda não enviada)
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  link?: string;
  imageUrl?: string;
}

export interface CreateNotificationDTO {
  title: string;
  message: string;
  userIds?: string[];
  groupIds?: string[];
  targetUserId?: string; // destinatário único (alvo "Por usuário")
  link?: string; // string vazia = remover o link
  image?: any; // Para upload de arquivo de imagem
  removeImage?: boolean; // remove a imagem já vinculada (edição)
}

export interface UpdateNotificationDTO {
  id: string;
  title?: string;
  message?: string;
  link?: string; // string vazia = remover o link
  image?: any; // Para upload de arquivo de imagem
  removeImage?: boolean; // remove a imagem já vinculada
}
