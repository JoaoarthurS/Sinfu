/**
 * Hook para gerenciar notificações Firebase
 * Facilita o uso do Firebase Messaging nos componentes
 */
import { useEffect, useState } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import firebaseMessagingService from '../../data/services/FirebaseMessagingService';
import localNotificationService from '../../data/services/LocalNotificationService';
import { container } from '../di/container';
import { STORAGE_KEYS } from '../../config/api.config';

export const useNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Abre um link se estiver presente nos dados da notificação
   */
  const handleNotificationLink = async (message: any) => {
    const link = message?.data?.link || message?.notification?.link;
    
    if (link) {
      try {
        console.log('🔗 Abrindo link da notificação:', link);
        const supported = await Linking.canOpenURL(link);
        if (supported) {
          await Linking.openURL(link);
        } else {
          console.error('Link não suportado:', link);
          Alert.alert('Erro', 'Não foi possível abrir este link');
        }
      } catch (error) {
        console.error('Erro ao abrir link:', error);
        Alert.alert('Erro', 'Não foi possível abrir este link');
      }
    }
  };

  /**
   * Inicializa o Firebase Messaging e obtém o token
   */
  const initializeNotifications = async () => {
    try {
      setLoading(true);
      const token = await firebaseMessagingService.getToken();
      
      if (token) {
        setFcmToken(token);
        // Salvar token localmente
        await container.storageService.setItem(STORAGE_KEYS.DEVICE_TOKEN, token);
      }
    } catch (error) {
      console.error('Erro ao inicializar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra o token FCM no backend
   */
  const registerToken = async (userId: number): Promise<boolean> => {
    try {
      if (!fcmToken) {
        console.log('Token FCM não disponível');
        return false;
      }

      const platform = Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : 'web';

      const response = await container.apiClient.post('/device-token', {
        token: fcmToken,
        user_id: userId,
        platform: platform,
      });

      console.log('Token registrado com sucesso:', response.data);
      return true;
    } catch (error) {
      console.error('Erro ao registrar token:', error);
      return false;
    }
  };

  /**
   * Configura listeners de notificações
   */
  useEffect(() => {
    // Listener para notificações em foreground
    const unsubscribeForeground = firebaseMessagingService.onMessage((message) => {
      console.log('Notificação recebida em foreground:', message);
      setNotification(message);
      // Com o app aberto o sistema não exibe a notificação automaticamente:
      // renderizamos uma notificação local para que o usuário a veja.
      localNotificationService.displayFromRemoteMessage(message);
    });

    // Listener para quando o app é aberto por uma notificação
    firebaseMessagingService.onNotificationOpenedApp(async (message) => {
      console.log('App aberto por notificação:', message);
      setNotification(message);
      await handleNotificationLink(message);
    });

    // Verificar se o app foi aberto por uma notificação
    firebaseMessagingService.getInitialNotification().then(async (message) => {
      if (message) {
        console.log('App iniciado por notificação:', message);
        setNotification(message);
        await handleNotificationLink(message);
      }
    });

    // Listener para quando o token é atualizado
    const unsubscribeTokenRefresh = firebaseMessagingService.onTokenRefresh((newToken) => {
      console.log('Token FCM atualizado:', newToken);
      setFcmToken(newToken);
      container.storageService.setItem(STORAGE_KEYS.DEVICE_TOKEN, newToken);
    });

    return () => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
    };
  }, []);

  return {
    fcmToken,
    notification,
    loading,
    initializeNotifications,
    registerToken,
    clearNotification: () => setNotification(null),
    handleNotificationLink,
  };
};
