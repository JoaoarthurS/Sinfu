/**
 * Configurações da API
 * Centralizando configurações seguindo boas práticas
 */
export const API_CONFIG = {
  BASE_URL: 'http://10.55.0.66:8000/api/',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@sinfu:auth_token',
  USER_DATA: '@sinfu:user_data',
  DEVICE_TOKEN: '@sinfu:device_token',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'auth/login',
    LOGOUT: 'auth/logout',
    REGISTER: 'auth/register',
    ME: 'auth/me',
  },

  DEVICE_TOKEN: {
    REGISTER: 'device-token',
  },
  NOTIFICATIONS: {
    LIST: 'notifications',
    MARK_READ: 'notifications/:id/read',
  },
  USERS: {
    LIST: 'users',
    DETAIL: 'users/:id',
  },
  GROUPS: {
    LIST: 'groups',
    CREATE: 'groups',
  },
} as const;
