/**
 * Group Entity - Representa um grupo no domínio da aplicação
 * Princípio SOLID: SRP (Single Responsibility Principle)
 */
export interface Group {
  id: string;
  name: string;
  description?: string;
  type: string;
  users?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGroupDTO {
  name: string;
  description?: string;
  type?: string;
  user_ids?: number[];
}

export interface UpdateGroupDTO {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  user_ids?: number[];
}

export interface NotifyGroupDTO {
  groupId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}
