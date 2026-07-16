/**
 * Context de Autenticação
 * Gerencia o estado global de autenticação da aplicação
 */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { User, UserRole } from '../../domain/entities/User';
import { container } from '../di/container';
import { STORAGE_KEYS } from '../../config/api.config';
import firebaseMessagingService from '../../data/services/FirebaseMessagingService';

type AuthPortal = 'user' | 'admin';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  currentPortal: AuthPortal;
  switchPortal: (portal: AuthPortal) => Promise<void>;
  signIn: (email: string, password: string, portal?: AuthPortal) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, groupIds?: string[]) => Promise<void>;
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
  const [currentPortal, setCurrentPortal] = useState<AuthPortal>('user');

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await container.authRepository.getCurrentUser();
      const storedPortal = await container.storageService.getItem(STORAGE_KEYS.AUTH_PORTAL);
      if (storedPortal === 'admin' || storedPortal === 'user') {
        setCurrentPortal(storedPortal);
      }
      
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
  const registerDeviceToken = async (
    userId: string | number,
    explicitToken?: string,
  ) => {
    try {
      // Usa o token recebido (ex.: do onTokenRefresh) ou busca o atual
      const fcmToken = explicitToken ?? (await firebaseMessagingService.getToken());

      if (!fcmToken) {
        console.log('Token FCM não disponível, pulando registro');
        return;
      }

      // Definir plataforma
      const platform = Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : 'web';

      // Enviar para API
      await container.apiClient.post('/device-token', {
        token: fcmToken,
        user_id: Number(userId),
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

  /**
   * Garante que o token FCM do dispositivo esteja sempre registrado no backend
   * enquanto houver usuário logado:
   *  - registra o token atual assim que o usuário é definido (cobre o
   *    auto-login por sessão salva, que antes não registrava nada);
   *  - re-registra quando o FCM rotaciona o token (onTokenRefresh), senão o
   *    backend continua disparando para um token antigo que vira UNREGISTERED.
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    // Registro inicial do token atual.
    registerDeviceToken(user.id);

    const unsubscribe = firebaseMessagingService.onTokenRefresh((newToken) => {
      console.log('Token FCM renovado, re-registrando no backend');
      registerDeviceToken(user.id, newToken);
    });

    return unsubscribe;
  }, [user]);

  /**
   * Alterna o portal ativo (painel admin ↔ feed) sem novo login.
   * Apenas administradores podem entrar no portal admin; a troca é persistida
   * para ser mantida ao reabrir o app.
   */
  const switchPortal = async (portal: AuthPortal) => {
    if (portal === 'admin' && user?.role !== UserRole.ADMIN) {
      return;
    }
    await container.storageService.setItem(STORAGE_KEYS.AUTH_PORTAL, portal);
    setCurrentPortal(portal);
  };

  const signIn = async (email: string, password: string, portal?: AuthPortal) => {
    // Não usar o estado global `loading` aqui: ele desmonta todo o navigator
    // (ver AppNavigator) e, ao alternar true/false em um login com erro, remonta
    // a navegação resetando para a tela inicial. A tela de login controla seu
    // próprio loading local. O navigator só deve trocar quando o usuário muda.
    try {
      const response = await container.loginUseCase.execute({ email, password });

      const requestedPortal = portal ?? (response.user.role === UserRole.ADMIN ? 'admin' : 'user');

      // Segurança: apenas administradores podem usar o portal admin.
      if (requestedPortal === 'admin' && response.user.role !== UserRole.ADMIN) {
        await container.authRepository.logout();
        setUser(null);
        setCurrentPortal('user');
        const accessError: any = new Error('Usuário sem permissão para acessar esta área.');
        accessError.code = 'ADMIN_ACCESS_DENIED';
        throw accessError;
      }

      await container.storageService.setItem(STORAGE_KEYS.AUTH_PORTAL, requestedPortal);
      setCurrentPortal(requestedPortal);

      setUser(response.user);

      // Registrar token FCM após login bem-sucedido
      await registerDeviceToken(response.user.id);
    } catch (error) {
      console.error('Sign in error:', {
        context: 'AuthContext.signIn',
        error
      });
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await container.authRepository.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', {
        context: 'AuthContext.forgotPassword',
        error,
      });
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string, groupIds?: string[]) => {
    // Mesmo motivo do signIn: não usar o `loading` global, que remontaria o
    // navigator e resetaria a navegação em caso de erro no cadastro.
    try {
      await container.authRepository.register({
        name,
        email,
        password,
        group_ids: groupIds,
      });

      const response = await container.loginUseCase.execute({ email, password });
      setUser(response.user);
      await registerDeviceToken(response.user.id);
    } catch (error) {
      console.error('Sign up error:', {
        context: 'AuthContext.signUp',
        error,
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await container.logoutUseCase.execute();
      setUser(null);
      setCurrentPortal('user');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      // Uma atualização de perfil nunca deve alterar o papel (role) do usuário
      // logado. Caso a API não retorne os papéis, preservamos o role atual para
      // evitar que o admin seja rebaixado e a navegação troque de stack.
      setUser({ ...user, ...userData, role: user.role });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        currentPortal,
        switchPortal,
        signIn,
        forgotPassword,
        signUp,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
