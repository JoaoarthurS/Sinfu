import { API_CONFIG } from '../../config/api.config';

// O backend pode construir URLs de imagem usando um host inacessível ao app
// (ex: APP_URL=http://localhost:8000). Substitui o origin pelo host da API.
// Extrai apenas scheme + host do BASE_URL; remover o path com replace quebrava
// quando o próprio host começava com "api." (ex: api.uninotes.unimontes.br).
const apiOrigin = API_CONFIG.BASE_URL.match(/^https?:\/\/[^/]+/)?.[0] ?? '';

export function fixImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (!apiOrigin) return url;
  // Substitui http(s)://qualquer-host pelo origin da API
  return url.replace(/^https?:\/\/[^/]+/, apiOrigin);
}
