/**
 * Implementação do Repositório de Perfil
 * Princípio SOLID: SRP - Responsável apenas pela lógica de perfil
 * Princípio SOLID: DIP - Depende de abstrações (IApiClient, IStorageService)
 */
import { IProfileRepository } from '../../domain/interfaces/IProfileRepository';
import { IApiClient } from '../../domain/interfaces/IApiClient';
import { IStorageService } from '../../domain/interfaces/IStorageService';
import { User, UserRole, UserGroup } from '../../domain/entities/User';
import { UpdateProfileDTO } from '../../domain/entities/UpdateProfileDTO';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../config/api.config';
import { fixImageUrl } from '../../core/utils/fixImageUrl';

export class ProfileRepository implements IProfileRepository {
  constructor(
    private apiClient: IApiClient,
    private storageService: IStorageService
  ) {}

  async getProfile(): Promise<User> {
    try {
      const response = await this.apiClient.get<any>(API_ENDPOINTS.PROFILE.GET);
      const apiUser = response.data;

      const user: User = {
        id: apiUser.id.toString(),
        name: apiUser.name,
        email: apiUser.email,
        role: this.mapRoleFromApi(apiUser.roles),
        profileImage: apiUser.profile_image,
        profileImageUrl: fixImageUrl(apiUser.profile_image_url),
        groups: this.mapGroups(apiUser.groups),
        createdAt: new Date(apiUser.created_at),
        updatedAt: new Date(apiUser.updated_at),
      };

      // Atualizar dados do usuário no storage
      await this.storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(data: UpdateProfileDTO): Promise<User> {
    try {
      // Criar FormData para enviar arquivo de imagem
      const formData = new FormData();

      if (data.name) {
        formData.append('name', data.name);
      }

      if (data.email) {
        formData.append('email', data.email);
      }

      if (data.password) {
        formData.append('password', data.password);
        if (data.password_confirmation) {
          formData.append('password_confirmation', data.password_confirmation);
        }
      }

      if (data.profile_image) {
        formData.append('profile_image', data.profile_image as any);
      }

      if (data.group_ids !== undefined) {
        data.group_ids.forEach((id, index) => {
          formData.append(`group_ids[${index}]`, id);
        });
      }

      const response = await this.apiClient.post<any>(
        API_ENDPOINTS.PROFILE.UPDATE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const apiUser = response.data.user;

      const user: User = {
        id: apiUser.id.toString(),
        name: apiUser.name,
        email: apiUser.email,
        role: this.mapRoleFromApi(apiUser.roles),
        profileImage: apiUser.profile_image,
        profileImageUrl: fixImageUrl(apiUser.profile_image_url),
        groups: this.mapGroups(apiUser.groups),
        createdAt: new Date(apiUser.created_at),
        updatedAt: new Date(apiUser.updated_at),
      };

      // Atualizar dados do usuário no storage
      await this.storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async removeProfileImage(): Promise<User> {
    try {
      const response = await this.apiClient.delete<any>(
        API_ENDPOINTS.PROFILE.REMOVE_IMAGE
      );

      const apiUser = response.data.user;

      const user: User = {
        id: apiUser.id.toString(),
        name: apiUser.name,
        email: apiUser.email,
        role: this.mapRoleFromApi(apiUser.roles),
        profileImage: apiUser.profile_image,
        profileImageUrl: fixImageUrl(apiUser.profile_image_url),
        groups: this.mapGroups(apiUser.groups),
        createdAt: new Date(apiUser.created_at),
        updatedAt: new Date(apiUser.updated_at),
      };

      // Atualizar dados do usuário no storage
      await this.storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Remove profile image error:', error);
      throw error;
    }
  }

  private mapRoleFromApi(roles: string[]): UserRole {
    return roles && roles.includes('admin') ? UserRole.ADMIN : UserRole.USER;
  }

  private mapGroups(groups: any[]): UserGroup[] {
    if (!Array.isArray(groups)) return [];
    return groups.map(g => ({
      id: g.id,
      name: g.name,
      isPublic: g.is_public ?? g.isPublic ?? false,
    }));
  }
}
