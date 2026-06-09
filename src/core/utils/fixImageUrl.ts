import { API_CONFIG } from '../../config/api.config';

// O backend constrói URLs de imagem usando APP_URL (ex: http://localhost:8000),
// mas o app conecta via ngrok. Substitui o origin pelo host configurado na API.
const apiOrigin = API_CONFIG.BASE_URL.replace(/\/api\/?.*$/, '');

export function fixImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  // Substitui http(s)://qualquer-host pelo origin da API
  return url.replace(/^https?:\/\/[^/]+/, apiOrigin);
}
