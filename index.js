/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Handler de mensagens em background. A exibição é feita nativamente
// (MyFirebaseMessagingService) e o link é aberto ao TOCAR na notificação
// (ver App.tsx e o intent nativo), nunca automaticamente no recebimento.
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Mensagem recebida em background:', remoteMessage?.messageId);
});

AppRegistry.registerComponent(appName, () => App);
