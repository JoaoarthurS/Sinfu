/**
 * Group Entity - Representa um grupo no domínio da aplicação
 * Princípio SOLID: SRP (Single Responsibility Principle)
 */
export interface Group {
  id: string;
  name: string;
  description?: string;
  type: string;
  isPublic: boolean;
  users?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  usersCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGroupDTO {
  name: string;
  description?: string;
  type?: string;
  is_public?: boolean;
  user_ids?: number[];
}

export interface UpdateGroupDTO {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  is_public?: boolean;
  user_ids?: number[];
}

export interface NotifyGroupDTO {
  groupId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  link?: string;
  image?: any; // Para upload de arquivo de imagem
}
