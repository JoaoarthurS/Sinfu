/**
 * 
 * 
 * Configurações da API
 * Centralizando configurações seguindo boas práticas
 */
export const API_CONFIG = {
  BASE_URL: 'https://a65b-200-17-122-126.ngrok-free.app/api/',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@sinfu:auth_token',
  USER_DATA: '@sinfu:user_data',
  AUTH_PORTAL: '@sinfu:auth_portal',
  DEVICE_TOKEN: '@sinfu:device_token',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'auth/login',
    FORGOT_PASSWORD: 'auth/forgot-password',
    LOGOUT: 'auth/logout',
    REGISTER: 'auth/register/user',
    ME: 'auth/me',
  },

  DEVICE_TOKEN: {
    REGISTER: 'device-token',
  },
  
  PROFILE: {
    GET: 'users/me',
    UPDATE: 'users/me',
    REMOVE_IMAGE: 'users/me/image',
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
