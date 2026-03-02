/**
 * Interface do Repositório de Perfil
 * Princípio SOLID: DIP (Dependency Inversion Principle)
 */
import { User } from '../entities/User';
import { UpdateProfileDTO } from '../entities/UpdateProfileDTO';

export interface IProfileRepository {
  getProfile(): Promise<User>;
  updateProfile(data: UpdateProfileDTO): Promise<User>;
  removeProfileImage(): Promise<User>;
}
