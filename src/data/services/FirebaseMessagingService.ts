/**
 * Serviço de Mensagens Firebase
 * Responsável por gerenciar tokens FCM e permissões de notificação
 * Princípio SOLID: SRP - Responsável apenas pela integração com Firebase
 */
import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';

export class FirebaseMessagingService {
  /**
   * Solicita permissão para notificações
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permissão de notificação negada');
          return false;
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Permissão de notificação concedida:', authStatus);
      }

      return enabled;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  }

  /**
   * Obtém o token FCM do dispositivo
   */
  async getToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermission();
      
      if (!hasPermission) {
        console.log('Sem permissão para obter token FCM');
        return null;
      }

      const token = await messaging().getToken();
      console.log('Token FCM obtido:', token);
      
      return token;
    } catch (error) {
      console.error('Erro ao obter token FCM:', error);
      return null;
    }
  }

  /**
   * Registra listener para quando o token é atualizado
   */
  onTokenRefresh(callback: (token: string) => void): () => void {
    return messaging().onTokenRefresh(callback);
  }

  /**
   * Registra listener para notificações em foreground
   */
  onMessage(callback: (message: any) => void): () => void {
    return messaging().onMessage(callback);
  }

  /**
   * Registra listener para notificações em background
   */
  setBackgroundMessageHandler(handler: (message: any) => Promise<void>): void {
    messaging().setBackgroundMessageHandler(handler);
  }

  /**
   * Obtém a notificação que abriu o app (se houver)
   */
  async getInitialNotification(): Promise<any | null> {
    try {
      return await messaging().getInitialNotification();
    } catch (error) {
      console.error('Erro ao obter notificação inicial:', error);
      return null;
    }
  }

  /**
   * Registra listener para quando uma notificação abre o app
   */
  onNotificationOpenedApp(callback: (message: any) => void): void {
    messaging().onNotificationOpenedApp(callback);
  }
}

export default new FirebaseMessagingService();
