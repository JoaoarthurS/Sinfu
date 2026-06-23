/**
 * App Principal
 * Ponto de entrada da aplicação com injeção de contextos
 */
import React, { useEffect } from 'react';
import { StatusBar, Linking } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/core/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function App() {
  // Abre o link da notificação ao TOCAR nela (não no recebimento).
  useEffect(() => {
    const openLinkFromMessage = (remoteMessage: any) => {
      const link = remoteMessage?.data?.link;
      if (link) {
        Linking.openURL(link).catch((err) =>
          console.error('Erro ao abrir link da notificação:', err),
        );
      }
    };

    // App em background e trazido ao foreground ao tocar na notificação.
    const unsubscribe = messaging().onNotificationOpenedApp(openLinkFromMessage);

    // App fechado (quit) e aberto ao tocar na notificação.
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          openLinkFromMessage(remoteMessage);
        }
      });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
