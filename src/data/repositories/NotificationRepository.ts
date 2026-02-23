/**
 * Implementação do Repositório de Notificações
 * Princípio SOLID: SRP - Responsável apenas pela lógica de notificações
 * Princípio SOLID: DIP - Depende de abstrações (IApiClient)
 */
import { INotificationRepository } from '../../domain/interfaces/INotificationRepository';
import { IApiClient } from '../../domain/interfaces/IApiClient';
import { Notification, CreateNotificationDTO, UpdateNotificationDTO } from '../../domain/entities/Notification';
import { API_ENDPOINTS } from '../../config/api.config';

export class NotificationRepository implements INotificationRepository {
  constructor(private apiClient: IApiClient) {}

  async getAll(): Promise<Notification[]> {
    try {
      console.log('📱 [NotificationRepository] Buscando notificações...');
      const response = await this.apiClient.get<{ data: Notification[] }>(
        API_ENDPOINTS.NOTIFICATIONS.LIST
      );

      console.log('📱 [NotificationRepository] Resposta recebida:', {
        status: response.status,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        dataType: typeof response.data,
        notificationCount: response.data?.data?.length || 0
      });

      if (!response.data || !response.data.data) {
        console.error('📱 [NotificationRepository] Estrutura de dados inválida:', response.data);
        return [];
      }

      const notifications = response.data.data.map(notification => ({
        ...notification,
        createdAt: new Date(notification.createdAt),
        updatedAt: new Date(notification.updatedAt),
      }));

      console.log('📱 [NotificationRepository] Notificações processadas:', notifications.length);
      console.log('📱 [NotificationRepository] Primeira notificação COMPLETA:', JSON.stringify(notifications[0], null, 2));
      console.log('📱 [NotificationRepository] URLs de imagens encontradas:', 
        notifications.filter(n => n.imageUrl).map(n => ({ id: n.id, imageUrl: n.imageUrl }))
      );

      return notifications;
    } catch (error: any) {
      console.error('📱 [NotificationRepository] Erro ao buscar notificações:', {
        message: error.message,
        status: error.status,
        response: error.response?.data
      });
      throw error;
    }
  }

  async getById(id: string): Promise<Notification | null> {
    try {
      const response = await this.apiClient.get<Notification>(
        `/notifications/${id}`
      );

      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };
    } catch (error) {
      console.error('Get notification by id error:', error);
      return null;
    }
  }

  async create(notification: CreateNotificationDTO): Promise<Notification> {
    try {
      let response;
      
      // Se houver uma imagem, enviar como FormData
      if (notification.image) {
        const formData = new FormData();
        formData.append('title', notification.title);
        formData.append('message', notification.message);
        formData.append('priority', notification.priority);
        
        if (notification.groupIds && notification.groupIds.length > 0) {
          notification.groupIds.forEach((id, index) => {
            formData.append(`groupIds[${index}]`, id);
          });
        }
        
        if (notification.userIds && notification.userIds.length > 0) {
          notification.userIds.forEach((id, index) => {
            formData.append(`userIds[${index}]`, id);
          });
        }
        
        if (notification.link) {
          formData.append('link', notification.link);
        }
        
        // Adicionar imagem ao FormData
        const imageFile = {
          uri: notification.image.uri,
          type: notification.image.type || 'image/jpeg',
          name: notification.image.fileName || 'notification_image.jpg',
        };
        formData.append('image', imageFile as any);
        
        response = await this.apiClient.post<Notification>(
          '/notifications/send',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // Enviar como JSON normal (sem imagem)
        response = await this.apiClient.post<Notification>(
          '/notifications/send',
          notification
        );
      }

      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  async update(notification: UpdateNotificationDTO): Promise<Notification> {
    try {
      const response = await this.apiClient.put<Notification>(
        `/notifications/${notification.id}`,
        notification
      );

      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };
    } catch (error) {
      console.error('Update notification error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      await this.apiClient.post(
        API_ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(':id', id)
      );
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }
}
