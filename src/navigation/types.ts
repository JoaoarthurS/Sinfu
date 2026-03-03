/**
 * Tipos de Navegação
 * Define a estrutura de rotas da aplicação
 */
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { User } from '../domain/entities/User';

export type RootStackParamList = {
  UserTypeSelection: undefined;
  AdminLogin: undefined;
  UserLogin: undefined;
  Login: undefined; // Mantido para compatibilidade
  UserDashboard: { user: User };
  AdminDashboard: { user: User };
  Groups: undefined;
  CreateNotification: undefined;
  Profile: undefined;
  SavedNotifications: undefined;
};

export type UserTypeSelectionScreenProps = NativeStackScreenProps<RootStackParamList, 'UserTypeSelection'>;
export type AdminLoginScreenProps = NativeStackScreenProps<RootStackParamList, 'AdminLogin'>;
export type UserLoginScreenProps = NativeStackScreenProps<RootStackParamList, 'UserLogin'>;
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type UserDashboardScreenProps = NativeStackScreenProps<RootStackParamList, 'UserDashboard'>;
export type AdminDashboardScreenProps = NativeStackScreenProps<RootStackParamList, 'AdminDashboard'>;
export type GroupsScreenProps = NativeStackScreenProps<RootStackParamList, 'Groups'>;
export type CreateNotificationScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateNotification'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;
export type SavedNotificationsScreenProps = NativeStackScreenProps<RootStackParamList, 'SavedNotifications'>;
