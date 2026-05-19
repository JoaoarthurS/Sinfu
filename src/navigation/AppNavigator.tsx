/**
 * Navegação Principal
 * Gerencia as rotas da aplicação baseado no estado de autenticação
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { RootStackParamList } from './types';
import { useAuth } from '../core/hooks/useAuth';
import { UserRole } from '../domain/entities/User';

// Importar telas
import {
  UserTypeSelectionScreen,
  AdminLoginScreen,
  UserLoginScreen,
  UserRegisterScreen,
  LoginScreen,
  UserDashboardScreen,
  AdminDashboardScreen,
  CreateNotificationScreen,
  ProfileScreen,
  SavedNotificationsScreen,
  GroupsScreen,
  UsersManagementScreen,
} from '../presentation/screens';
import { theme } from '../config/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, loading, isAuthenticated, currentPortal } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen 
              name="UserTypeSelection" 
              component={UserTypeSelectionScreen} 
            />
            <Stack.Screen 
              name="AdminLogin" 
              component={AdminLoginScreen} 
            />
            <Stack.Screen 
              name="UserLogin" 
              component={UserLoginScreen} 
            />
            <Stack.Screen
              name="UserRegister"
              component={UserRegisterScreen}
            />
          </>
        ) : user?.role === UserRole.ADMIN && currentPortal === 'admin' ? (
          <>
            <Stack.Screen 
              name="AdminDashboard" 
              component={AdminDashboardScreen}
              initialParams={{ user: user || undefined }}
            />
            <Stack.Screen 
              name="Groups" 
              component={GroupsScreen}
              options={{ headerShown: true, title: 'Grupos' }}
            />
            <Stack.Screen
              name="UsersManagement"
              component={UsersManagementScreen}
              options={{ headerShown: true, title: 'Usuários' }}
            />
            <Stack.Screen 
              name="CreateNotification" 
              component={CreateNotificationScreen}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
            />
            <Stack.Screen 
              name="SavedNotifications" 
              component={SavedNotificationsScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="UserDashboard" 
              component={UserDashboardScreen}
              initialParams={{ user: user || undefined }}
            />
            <Stack.Screen 
              name="SavedNotifications" 
              component={SavedNotificationsScreen}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
