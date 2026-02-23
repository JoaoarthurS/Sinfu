/**
 * Interface do Repositório de Grupos
 * Princípio SOLID: ISP - Interface Segregation Principle
 * Princípio SOLID: DIP - Dependency Inversion Principle
 */
import { Group, CreateGroupDTO, UpdateGroupDTO, NotifyGroupDTO } from '../entities/Group';

export interface IGroupRepository {
  getAll(): Promise<Group[]>;
  getById(id: string): Promise<Group | null>;
  create(group: CreateGroupDTO): Promise<Group>;
  update(group: UpdateGroupDTO): Promise<Group>;
  delete(id: string): Promise<void>;
  notifyGroup(notifyData: NotifyGroupDTO): Promise<{ message: string; users_count: number; tokens_count: number }>;
}
