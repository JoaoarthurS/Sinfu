/**
 * Traduz erros de API em mensagens amigáveis para o usuário final.
 * Nunca expõe detalhes técnicos como stack traces, SQL ou mensagens internas.
 */

export function getErrorMessage(error: any): string {
  if (!error) return 'Ocorreu um erro inesperado. Tente novamente.';

  const status: number = error?.status ?? error?.response?.status ?? 0;

  if (status === 0) {
    return 'Falha de comunicação com o servidor. Verifique sua conexão e tente novamente.';
  }

  switch (status) {
    case 400:
      return 'Dados inválidos. Verifique as informações e tente novamente.';
    case 401:
      return 'E-mail ou senha incorretos.';
    case 403:
      return 'Você não tem permissão para realizar esta ação.';
    case 404:
      return 'Recurso não encontrado.';
    case 409:
      return 'Este registro já existe.';
    case 422:
      return extractValidationMessage(error);
    case 429:
      return 'Muitas tentativas. Aguarde um momento e tente novamente.';
    default:
      if (status >= 500) {
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      }
      return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}

/** Extrai a primeira mensagem de validação amigável retornada pelo backend. */
function extractValidationMessage(error: any): string {
  const errors = error?.errors;
  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    if (firstKey && Array.isArray(errors[firstKey]) && errors[firstKey][0]) {
      return errors[firstKey][0];
    }
  }
  return error?.message || 'Os dados informados são inválidos.';
}

/** Versão para erros de sessão expirada (contexto: usuário já autenticado). */
export function getSessionErrorMessage(error: any): string {
  const status: number = error?.status ?? error?.response?.status ?? 0;
  if (status === 401) {
    return 'Sua sessão expirou. Faça login novamente.';
  }
  return getErrorMessage(error);
}
