import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateUser } from '@/redux/slices/authSlice';
import api from "./api";
import { useCallback } from 'react';

export const UseSetupPushNotifications = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth?.user ?? null);

  return useCallback(async (saveToBackend = true) => {
    if (!Constants.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    try {
      // Check current permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      
      // Only request if not already granted
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: { allowAlert: true, allowBadge: true, allowSound: true },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions denied');
        return null;
      }

      // Android channel setup
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Get push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.error('Project ID not found');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

      // Save to backend if authenticated
      if (saveToBackend && user?.id && token) {
        try {
          await api.post('/users/save-token', { token, userId: user.id });
          dispatch(updateUser({ expoPushToken: token }));
        } catch (error) {
          console.error('Failed to save push token to backend:', error);
          // Still save to Redux for local use
          dispatch(updateUser({ expoPushToken: token }));
        }
      }

      return token;
    } catch (error) {
      console.error('Push notification setup error:', error);
      return null;
    }
  }, [dispatch, user]);
};

// Listener setup remains the same
export const registerNotificationListeners = (
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationResponse: (response: Notifications.NotificationResponse) => void
) => {
  const notificationListener = Notifications.addNotificationReceivedListener(onNotificationReceived);
  const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
};