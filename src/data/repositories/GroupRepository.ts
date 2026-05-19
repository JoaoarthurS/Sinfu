/**
 * Implementação do Repositório de Grupos
 * Princípio SOLID: SRP - Responsável apenas pela lógica de grupos
 * Princípio SOLID: DIP - Depende de abstrações (IApiClient)
 */
import { IGroupRepository } from '../../domain/interfaces/IGroupRepository';
import { IApiClient } from '../../domain/interfaces/IApiClient';
import { Group, CreateGroupDTO, UpdateGroupDTO, NotifyGroupDTO } from '../../domain/entities/Group';

export class GroupRepository implements IGroupRepository {
  constructor(private apiClient: IApiClient) {}

  private mapGroup(raw: any): Group {
    return {
      ...raw,
      isPublic: raw.is_public ?? raw.isPublic ?? true,
      createdAt: new Date(raw.createdAt ?? raw.created_at),
      updatedAt: new Date(raw.updatedAt ?? raw.updated_at),
    };
  }

  async getAll(): Promise<Group[]> {
    try {
      const response = await this.apiClient.get<any>('/groups');
      const items = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
      return items.map((g: any) => this.mapGroup(g));
    } catch (error) {
      console.error('Get all groups error:', error);
      throw error;
    }
  }

  async getPublicGroups(): Promise<Group[]> {
    try {
      const response = await this.apiClient.get<any[]>('/groups/public');
      return response.data.map(g => this.mapGroup(g));
    } catch (error) {
      console.error('Get public groups error:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Group | null> {
    try {
      const response = await this.apiClient.get<any>(`/groups/${id}`);
      return this.mapGroup(response.data);
    } catch (error) {
      console.error('Get group by id error:', error);
      return null;
    }
  }

  async create(group: CreateGroupDTO): Promise<Group> {
    try {
      const response = await this.apiClient.post<any>('/groups', group);
      return this.mapGroup(response.data);
    } catch (error) {
      console.error('Create group error:', error);
      throw error;
    }
  }

  async update(group: UpdateGroupDTO): Promise<Group> {
    try {
      const response = await this.apiClient.put<any>(`/groups/${group.id}`, group);
      return this.mapGroup(response.data);
    } catch (error) {
      console.error('Update group error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`/groups/${id}`);
    } catch (error) {
      console.error('Delete group error:', error);
      throw error;
    }
  }

  async notifyGroup(notifyData: NotifyGroupDTO): Promise<{ message: string; users_count: number; tokens_count: number }> {
    try {
      const { groupId, ...payload } = notifyData;
      const requestPayload = {
        ...payload,
        // Backend NotificationRequest exige "filters" como obrigatório.
        filters: {
          groups: [groupId],
        },
      };
      const response = await this.apiClient.post<{ message: string; users_count: number; tokens_count: number }>(
        `/notify-group/${groupId}`,
        requestPayload
      );
      return response.data;
    } catch (error) {
      console.error('Notify group error:', error);
      throw error;
    }
  }
}
