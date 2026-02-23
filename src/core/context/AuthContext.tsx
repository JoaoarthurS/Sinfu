/**
 * Context de Autenticação
 * Gerencia o estado global de autenticação da aplicação
 */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { User } from '../../domain/entities/User';
import { container } from '../di/container';
import { STORAGE_KEYS } from '../../config/api.config';
import firebaseMessagingService from '../../data/services/FirebaseMessagingService';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await container.authRepository.getCurrentUser();
      
      if (storedUser) {
        const token = await container.storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
        
        if (token) {
          const isValid = await container.authRepository.validateToken(token);
          
          if (isValid) {
            setUser(storedUser);
          } else {
            // Token inválido, limpar dados
            await container.authRepository.logout();
          }
        }
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra o token FCM no backend após login
   */
  const registerDeviceToken = async (userId: number) => {
    try {
      // Obter o token FCM
      const fcmToken = await firebaseMessagingService.getToken();
      
      if (!fcmToken) {
        console.log('Token FCM não disponível, pulando registro');
        return;
      }

      // Definir plataforma
      const platform = Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : 'web';

      // Enviar para API
      await container.apiClient.post('/device-token', {
        token: fcmToken,
        user_id: userId,
        platform: platform,
      });

      console.log('Token FCM registrado com sucesso no backend');
    } catch (error) {
      console.error('Erro ao registrar token FCM:', {
        context: 'AuthContext.registerDeviceToken',
        error
      });
      // Não lançar erro para não bloquear o login
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await container.loginUseCase.execute({ email, password });
      console.warn(response);
      setUser(response.user);
      
      // Registrar token FCM após login bem-sucedido
      await registerDeviceToken(response.user.id);
    } catch (error) {
      console.error('Sign in error:', {
        context: 'AuthContext.signIn',
        error
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await container.logoutUseCase.execute();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
