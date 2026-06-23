/**
 * Compartilhamento de notificações.
 *
 * Monta um texto limpo e amigável (sem emojis e sem o link técnico da imagem da
 * API) e, quando a notificação possui imagem, envia a própria imagem como
 * anexo (e não como link), usando react-native-share.
 *
 * Se a notificação não tiver imagem — ou se a lib nativa não estiver instalada/
 * vinculada — faz fallback para o compartilhamento de texto nativo.
 */
import { Share as RNShare } from 'react-native';
import { Notification } from '../../domain/entities/Notification';

/**
 * Monta o texto do compartilhamento com cada campo rotulado (título, descrição,
 * link de destino e data/hora). Os rótulos usam *negrito* (renderizado no
 * WhatsApp) e nunca incluímos o link técnico da imagem da API.
 */
function buildShareMessage(notification: Notification): string {
  const dateTime = new Date(notification.createdAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines: string[] = [
    `*Título:* ${notification.title}`,
    '',
    `*Descrição:* ${notification.message}`,
  ];

  // Mantemos apenas o link de destino real (se houver), nunca o link da imagem.
  if (notification.link && notification.link.trim().length > 0) {
    lines.push('', `*Link:* ${notification.link.trim()}`);
  }

  lines.push('', `*Data e hora:* ${dateTime}`);

  return lines.join('\n');
}

/**
 * Baixa a imagem e a converte em data URI (base64) usando fetch + FileReader,
 * que é a forma confiável no React Native (axios/arraybuffer costuma retornar
 * dados inválidos, fazendo a imagem não ser anexada).
 */
async function fetchImageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      // Evita que proxies como o ngrok devolvam a pagina HTML de aviso no lugar
      // da imagem (o que faria o anexo sair como link/HTML em vez da imagem).
      Accept: 'image/*',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao baixar imagem (HTTP ${response.status})`);
  }

  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string' && reader.result.length > 0) {
        // Se o blob veio sem content-type de imagem, o data URI pode sair como
        // application/octet-stream e o app de destino não reconhece como imagem.
        // Forçamos image/jpeg nesse caso.
        const dataUrl = reader.result.startsWith('data:image')
          ? reader.result
          : reader.result.replace(/^data:[^;]*;/, 'data:image/jpeg;');
        resolve(dataUrl);
      } else {
        reject(new Error('Não foi possível ler a imagem.'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('Erro ao ler a imagem.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Compartilha a notificação. Quando há imagem, envia a imagem em si como anexo;
 * caso contrário (ou em falha), compartilha apenas o texto.
 */
export async function shareNotification(notification: Notification): Promise<void> {
  const message = buildShareMessage(notification);

  if (notification.imageUrl && notification.imageUrl.trim().length > 0) {
    try {
      // Lazy require: se a lib nativa não estiver instalada/linkada, cai no
      // fallback de texto abaixo em vez de quebrar a tela.
      const RNShareLib = require('react-native-share').default;

      const dataUrl = await fetchImageAsDataUrl(notification.imageUrl);

      await RNShareLib.open({
        title: notification.title,
        message,
        url: dataUrl,
        type: 'image/jpeg',
        failOnCancel: false,
      });
      return;
    } catch (error) {
      console.error('Falha ao compartilhar a imagem, usando texto:', error);
      // Continua para o fallback de texto.
    }
  }

  await RNShare.share({ message, title: notification.title });
}
