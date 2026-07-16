/**
 * Serviço de Notificações Locais (Notifee)
 * Responsável por exibir notificações visíveis quando o app está em foreground.
 *
 * O FCM só exibe a notificação automaticamente quando o app está em background
 * ou fechado. Com o app aberto (foreground), o sistema NÃO mostra nada — cabe
 * ao app renderizar uma notificação local. Este serviço cuida disso.
 *
 * Princípio SOLID: SRP - responsável apenas por exibir notificações locais.
 */
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';

const DEFAULT_CHANNEL_ID = 'default';

export class LocalNotificationService {
  private channelCreated = false;

  /**
   * Garante que o canal padrão do Android existe (obrigatório no Android 8+).
   */
  private async ensureChannel(): Promise<string> {
    if (!this.channelCreated) {
      await notifee.createChannel({
        id: DEFAULT_CHANNEL_ID,
        name: 'Notificações',
        importance: AndroidImportance.HIGH,
      });
      this.channelCreated = true;
    }
    return DEFAULT_CHANNEL_ID;
  }

  /**
   * Exibe uma notificação local a partir de uma mensagem do FCM.
   */
  async displayFromRemoteMessage(message: any): Promise<void> {
    try {
      const channelId = await this.ensureChannel();

      const title =
        message?.notification?.title ?? message?.data?.title ?? 'UniNotes';
      const body =
        message?.notification?.body ?? message?.data?.body ?? '';
      const imageUrl =
        message?.notification?.android?.imageUrl ??
        message?.data?.image_url ??
        message?.data?.image;

      await notifee.displayNotification({
        title,
        body,
        data: message?.data ?? {},
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          pressAction: { id: 'default' },
          ...(imageUrl
            ? {
                largeIcon: imageUrl,
                style: { type: AndroidStyle.BIGPICTURE, picture: imageUrl },
              }
            : {}),
        },
      });
    } catch (error) {
      console.error('Erro ao exibir notificação local:', error);
    }
  }
}

export default new LocalNotificationService();
