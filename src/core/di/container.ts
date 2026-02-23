/**
 * Container de Injeção de Dependências
 * Princípio SOLID: DIP - Gerencia a criação e injeção de dependências
 * 
 * Este container centraliza a criação de todas as instâncias,
 * facilitando testes e manutenção
 */
import { AxiosApiClient } from '../../data/services/AxiosApiClient';
import { AsyncStorageService } from '../../data/services/AsyncStorageService';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { NotificationRepository } from '../../data/repositories/NotificationRepository';
import { GroupRepository } from '../../data/repositories/GroupRepository';
import { LoginUseCase } from '../../domain/useCases/LoginUseCase';
import { LogoutUseCase } from '../../domain/useCases/LogoutUseCase';
import { GetAllNotificationsUseCase } from '../../domain/useCases/GetAllNotificationsUseCase';
import { CreateNotificationUseCase } from '../../domain/useCases/CreateNotificationUseCase';
import { UpdateNotificationUseCase } from '../../domain/useCases/UpdateNotificationUseCase';
import { DeleteNotificationUseCase } from '../../domain/useCases/DeleteNotificationUseCase';
import { GetAllGroupsUseCase } from '../../domain/useCases/GetAllGroupsUseCase';
import { CreateGroupUseCase } from '../../domain/useCases/CreateGroupUseCase';
import { UpdateGroupUseCase } from '../../domain/useCases/UpdateGroupUseCase';
import { DeleteGroupUseCase } from '../../domain/useCases/DeleteGroupUseCase';
import { NotifyGroupUseCase } from '../../domain/useCases/NotifyGroupUseCase';

class DIContainer {
  private static instance: DIContainer;
  
  // Services
  private _apiClient?: AxiosApiClient;
  private _storageService?: AsyncStorageService;
  
  // Repositories
  private _authRepository?: AuthRepository;
  private _notificationRepository?: NotificationRepository;
  private _groupRepository?: GroupRepository;
  
  // Use Cases
  private _loginUseCase?: LoginUseCase;
  private _logoutUseCase?: LogoutUseCase;
  private _getAllNotificationsUseCase?: GetAllNotificationsUseCase;
  private _createNotificationUseCase?: CreateNotificationUseCase;
  private _updateNotificationUseCase?: UpdateNotificationUseCase;
  private _deleteNotificationUseCase?: DeleteNotificationUseCase;
  private _getAllGroupsUseCase?: GetAllGroupsUseCase;
  private _createGroupUseCase?: CreateGroupUseCase;
  private _updateGroupUseCase?: UpdateGroupUseCase;
  private _deleteGroupUseCase?: DeleteGroupUseCase;
  private _notifyGroupUseCase?: NotifyGroupUseCase;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Services
  get apiClient(): AxiosApiClient {
    if (!this._apiClient) {
      this._apiClient = new AxiosApiClient();
    }
    return this._apiClient;
  }

  get storageService(): AsyncStorageService {
    if (!this._storageService) {
      this._storageService = new AsyncStorageService();
    }
    return this._storageService;
  }

  // Repositories
  get authRepository(): AuthRepository {
    if (!this._authRepository) {
      this._authRepository = new AuthRepository(
        this.apiClient,
        this.storageService
      );
    }
    return this._authRepository;
  }


  get groupRepository(): GroupRepository {
    if (!this._groupRepository) {
      this._groupRepository = new GroupRepository(this.apiClient);
    }
    return this._groupRepository;
  }
  get notificationRepository(): NotificationRepository {
    if (!this._notificationRepository) {
      this._notificationRepository = new NotificationRepository(this.apiClient);
    }
    return this._notificationRepository;
  }

  // Use Cases
  get loginUseCase(): LoginUseCase {
    if (!this._loginUseCase) {
      this._loginUseCase = new LoginUseCase(this.authRepository);
    }
    return this._loginUseCase;
  }

  get logoutUseCase(): LogoutUseCase {
    if (!this._logoutUseCase) {
      this._logoutUseCase = new LogoutUseCase(this.authRepository);
    }
    return this._logoutUseCase;
  }

  get getAllNotificationsUseCase(): GetAllNotificationsUseCase {
    if (!this._getAllNotificationsUseCase) {
      this._getAllNotificationsUseCase = new GetAllNotificationsUseCase(
        this.notificationRepository
      );
    }
    return this._getAllNotificationsUseCase;
  }

  get createNotificationUseCase(): CreateNotificationUseCase {
    if (!this._createNotificationUseCase) {
      this._createNotificationUseCase = new CreateNotificationUseCase(
        this.notificationRepository
      );
    }
    return this._createNotificationUseCase;
  }

  get updateNotificationUseCase(): UpdateNotificationUseCase {
    if (!this._updateNotificationUseCase) {
      this._updateNotificationUseCase = new UpdateNotificationUseCase(
        this.notificationRepository
      );
    }
    return this._updateNotificationUseCase;
  }

  get deleteNotificationUseCase(): DeleteNotificationUseCase {
    if (!this._deleteNotificationUseCase) {
      this._deleteNotificationUseCase = new DeleteNotificationUseCase(
        this.notificationRepository
      );
    }
    return this._deleteNotificationUseCase;
  }

  get getAllGroupsUseCase(): GetAllGroupsUseCase {
    if (!this._getAllGroupsUseCase) {
      this._getAllGroupsUseCase = new GetAllGroupsUseCase(
        this.groupRepository
      );
    }
    return this._getAllGroupsUseCase;
  }

  get createGroupUseCase(): CreateGroupUseCase {
    if (!this._createGroupUseCase) {
      this._createGroupUseCase = new CreateGroupUseCase(
        this.groupRepository
      );
    }
    return this._createGroupUseCase;
  }

  get updateGroupUseCase(): UpdateGroupUseCase {
    if (!this._updateGroupUseCase) {
      this._updateGroupUseCase = new UpdateGroupUseCase(
        this.groupRepository
      );
    }
    return this._updateGroupUseCase;
  }

  get deleteGroupUseCase(): DeleteGroupUseCase {
    if (!this._deleteGroupUseCase) {
      this._deleteGroupUseCase = new DeleteGroupUseCase(
        this.groupRepository
      );
    }
    return this._deleteGroupUseCase;
  }

  get notifyGroupUseCase(): NotifyGroupUseCase {
    if (!this._notifyGroupUseCase) {
      this._notifyGroupUseCase = new NotifyGroupUseCase(
        this.groupRepository
      );
    }
    return this._notifyGroupUseCase;
  }

  // Reset para testes
  reset(): void {
    this._apiClient = undefined;
    this._storageService = undefined;
    this._authRepository = undefined;
    this._notificationRepository = undefined;
    this._groupRepository = undefined;
    this._loginUseCase = undefined;
    this._logoutUseCase = undefined;
    this._getAllNotificationsUseCase = undefined;
    this._createNotificationUseCase = undefined;
    this._updateNotificationUseCase = undefined;
    this._deleteNotificationUseCase = undefined;
    this._getAllGroupsUseCase = undefined;
    this._createGroupUseCase = undefined;
    this._updateGroupUseCase = undefined;
    this._deleteGroupUseCase = undefined;
    this._notifyGroupUseCase = undefined;
  }
}

export const container = DIContainer.getInstance();
