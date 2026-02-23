/**
 * @format
 */

import { AppRegistry, Linking } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Registrar handler de mensagens em background
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Mensagem recebida em background:', remoteMessage);
  
  // Se a mensagem contém um link, abrir automaticamente
  const link = remoteMessage?.data?.link || remoteMessage?.notification?.link;
  if (link) {
    try {
      const supported = await Linking.canOpenURL(link);
      if (supported) {
        console.log('🔗 Abrindo link em background:', link);
        await Linking.openURL(link);
      }
    } catch (error) {
      console.error('Erro ao abrir link em background:', error);
    }
  }
});

AppRegistry.registerComponent(appName, () => App);
