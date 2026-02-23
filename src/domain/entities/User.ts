/**
 * User Entity - Representa um usuário no domínio da aplicação
 * Princípio SOLID: SRP (Single Responsibility Principle)
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  profileImageUrl?: string;
  deviceToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
