import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';

export async function registerForPushNotificationsAsync() {
  let token;

  // Check if running on a physical device
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Request notification permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  // Get the push token
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push Token:', token);

  // Send the token to your backend
  sendPushTokenToBackend(token);

  return token;
}

// Example function to send token to your backend
interface PushTokenPayload {
  token: string;
}

async function sendPushTokenToBackend(token: string): Promise<void> {
  try {
    await api.post('/users/test/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token } as PushTokenPayload),
    });
  } catch (error) {
    console.error('Error sending push token to backend:', error);
  }
}
