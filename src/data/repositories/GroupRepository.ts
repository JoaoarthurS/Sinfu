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

  async getAll(): Promise<Group[]> {
    try {
      const response = await this.apiClient.get<Group[]>('/groups');
      return response.data.map(group => ({
        ...group,
        createdAt: new Date(group.createdAt),
        updatedAt: new Date(group.updatedAt),
      }));
    } catch (error) {
      console.error('Get all groups error:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Group | null> {
    try {
      const response = await this.apiClient.get<Group>(`/groups/${id}`);
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };
    } catch (error) {
      console.error('Get group by id error:', error);
      return null;
    }
  }

  async create(group: CreateGroupDTO): Promise<Group> {
    try {
      const response = await this.apiClient.post<Group>('/groups', group);
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };
    } catch (error) {
      console.error('Create group error:', error);
      throw error;
    }
  }

  async update(group: UpdateGroupDTO): Promise<Group> {
    try {
      const response = await this.apiClient.put<Group>(
        `/groups/${group.id}`,
        group
      );
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };
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
      const response = await this.apiClient.post<{ message: string; users_count: number; tokens_count: number }>(
        `/notify-group/${groupId}`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Notify group error:', error);
      throw error;
    }
  }
}
