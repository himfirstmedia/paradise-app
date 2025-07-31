import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateUser } from '@/redux/slices/authSlice';
import  api  from "./api";


// Custom hook to handle push notification setup
export const SetupPushNotifications = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const initializeNotifications = async () => {
    try {
      // Check if running on a physical device
      if (!Constants.isDevice) {
        console.log('Push notifications are only supported on physical devices.');
        return null;
      }

      // Request notification permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted.');
        return null;
      }

      // Get the Expo push token
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;

      if (!token) {
        console.log('Failed to retrieve Expo push token.');
        return null;
      }

      // Only send to backend and update Redux if user is authenticated
      if (user?.id) {
        try {
          // Send the token to the backend
          await api.post(`/users/save-token`, {
            token,
            userId: user.id,
          });

          // Update Redux store with the new token
          dispatch(updateUser({ expoPushToken: token }));
          console.log('Push token saved successfully:', token);
        } catch (error) {
          console.error('Error saving push token to backend:', error);
          return null;
        }
      } else {
        console.log('No authenticated user found. Skipping token save.');
        return null;
      }

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Set up notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,     
          shouldShowBanner: true,    
          shouldShowList: true,     
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      return token;
    } catch (error) {
      console.error('Error setting up push notifications:', error);
      return null;
    }
  };

  return initializeNotifications;
};

// Function to register notification listeners
export const registerNotificationListeners = (
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationResponse: (response: Notifications.NotificationResponse) => void
) => {
  // Handle notifications received while the app is in the foreground
  const notificationListener = Notifications.addNotificationReceivedListener(onNotificationReceived);

  // Handle user interaction with notifications
  const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

  // Return cleanup function to remove listeners
  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
};