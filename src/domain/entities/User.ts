/**
 * User Entity - Representa um usuário no domínio da aplicação
 * Princípio SOLID: SRP (Single Responsibility Principle)
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface UserGroup {
  id: string;
  name: string;
  isPublic: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  profileImageUrl?: string;
  deviceToken?: string;
  groups?: UserGroup[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  group_ids?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
