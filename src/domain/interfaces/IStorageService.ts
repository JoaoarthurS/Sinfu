/**
 * Interface do Serviço de Storage
 * Princípio SOLID: ISP (Interface Segregation Principle)
 * Interface específica para operações de storage
 */
export interface IStorageService {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}
