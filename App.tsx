/**
 * App Principal
 * Ponto de entrada da aplicação com injeção de contextos
 */
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/core/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function App() {
  // Ao tocar na notificação, o app é aberto normalmente (sem redirecionar
  // para o link da notificação).
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
