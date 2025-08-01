import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateUser } from '@/redux/slices/authSlice';
import  api  from "./api";


export const SetupPushNotifications = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const initializeNotifications = async (saveToBackend = true) => {
    try {
      if (!Constants.isDevice) {
        console.log('Push notifications are only supported on physical devices.');
        return null;
      }

      console.log('Checking notification permissions...');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('Existing permission status:', existingStatus);

      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        console.log('Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync({
          ios: { allowAlert: true, allowBadge: true, allowSound: true },
        });
        finalStatus = status;
        console.log('Requested permission status:', finalStatus);
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted.');
        return null;
      }

      console.log('Retrieving Expo push token...');
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      console.log('Expo push token:', token);

      if (user?.id) {
        console.log('Saving push token for user:', user.id);
        try {
          await api.post(`/users/save-token`, {
            token,
            userId: user.id,
          });
          console.log('Push token saved successfully:', token);
          dispatch(updateUser({ expoPushToken: token }));
        } catch (error) {
          console.error('Error saving push token to backend:', error);
          return null;
        }
      } else {
        console.log('No authenticated user. Token not saved.');
      }

      if (Platform.OS === 'android') {
        console.log('Setting Android notification channel...');
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      console.log('Setting notification handler...');
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