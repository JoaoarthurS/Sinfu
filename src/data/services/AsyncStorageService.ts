/**
 * Implementação concreta do Storage Service usando AsyncStorage
 * Princípio SOLID: DIP - Implementa a interface IStorageService
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorageService } from '../../domain/interfaces/IStorageService';

export class AsyncStorageService implements IStorageService {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
      throw new Error('Failed to save data');
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from AsyncStorage:', error);
      throw new Error('Failed to remove data');
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      throw new Error('Failed to clear storage');
    }
  }
}
