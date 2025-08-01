import React, { useEffect, useState, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Alert } from '@/components/Alert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { ThemedCheckbox, ThemedEmailInput } from '@/components/ThemedInput';
import { ThemedPassword } from '@/components/ThemedPassword';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useReduxAuth } from '@/hooks/useReduxAuth';
import { useAppSelector } from '@/redux/hooks';
import { UseSetupPushNotifications } from '@/utils/notificationHandler';
import { persistor } from '@/redux/store';

type AppRoutes =
  | '/(director)'
  | '/(resident-manager)'
  | '/(facility-manager)'
  | '/(residents)'
  | '/(individuals)'
  | '/auth/login';

export default function LoginScreen() {
  const router = useRouter();
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'default' | 'error' | 'success'>('default');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double clicks
  const { signin, loading } = useReduxAuth();
  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === 'web' && width >= 1024;
  const isMediumScreen = Platform.OS === 'web' && width >= 768;

  const isAuthenticated = useAppSelector((state) => state?.auth?.isAuthenticated ?? false);
  const user = useAppSelector((state) => state?.auth?.user ?? null);

  useEffect(() => {
    if (alertMessage) {
      const timeout = setTimeout(() => setAlertMessage(''), 6000);
      return () => clearTimeout(timeout);
    }
  }, [alertMessage]);

  useEffect(() => {
    if (!isAuthenticated || !user?.role) return; // Avoid navigation if not fully authenticated

    const roleRoutes: Record<string, AppRoutes> = {
      SUPER_ADMIN: '/(director)',
      DIRECTOR: '/(director)',
      RESIDENT_MANAGER: '/(resident-manager)',
      FACILITY_MANAGER: '/(facility-manager)',
      RESIDENT: '/(residents)',
      INDIVIDUAL: '/(individuals)',
    };

    const route = roleRoutes[user.role] || '/auth/login';
    console.log('Navigating to:', route, 'User:', user);
    router.replace(route); // Use replace to avoid stacking routes
  }, [isAuthenticated, user, router]);

  const handleSignin = useCallback(async (): Promise<void> => {
    if (isSubmitting || !email || !password) {
      if (!email || !password) {
        setAlertMessage('Please enter both email and password.');
        setAlertType('error');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Only purge if necessary (e.g., to clear stale data)
      await persistor.purge();
      const result = await signin(email, password).unwrap();
      if (result) {
        await UseSetupPushNotifications();
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Invalid credentials. Please try again.';
      setAlertMessage(errorMessage);
      setAlertType('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, signin, isSubmitting]);

  const responsiveStyles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: isLargeScreen ? 40 : 20,
    },
    containerPadding: {
      paddingHorizontal: isLargeScreen ? 300 : isMediumScreen ? 150 : 15,
    },
    scriptureSection: {
      marginBottom: isLargeScreen ? 15 : 20,
      marginTop: isLargeScreen ? 10 : 5,
      maxHeight: isLargeScreen ? 200 : 100,
    },
    taskSection: {
      marginTop: isLargeScreen ? 10 : 5,
    },
  });

  return (
    <ThemedView style={[styles.container, responsiveStyles.containerPadding]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
      >
        <ThemedView style={styles.logo}>
          <Image
            source={require('../../assets/images/logo-new.png')}
            style={{ height: 150, width: 150 }}
          />
        </ThemedView>

        <ThemedText type="subtitle" style={{ marginBottom: '5%' }}>
          Sign into your account
        </ThemedText>

        {alertMessage ? <Alert message={alertMessage} type={alertType} duration={6000} /> : null}

        <ThemedView style={styles.inputField}>
          <ThemedText type="default">Email</ThemedText>
          <ThemedEmailInput
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
          />
        </ThemedView>

        <ThemedView style={styles.inputField}>
          <ThemedText type="default">Password</ThemedText>
          <ThemedPassword
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
          />
        </ThemedView>

        <View style={{ width: '100%', alignItems: 'flex-end' }}>
          <ThemedText
            type="link"
            onPress={() => router.push('/auth/forgot_password')}
          >
            Forgot Password?
          </ThemedText>
        </View>

        <View style={{ width: '100%', alignItems: 'flex-start' }}>
          <ThemedCheckbox
            label="By using this app, you agree to the terms and conditions."
            checked={checked}
            onChange={setChecked}
          />
        </View>

        <View style={{ marginTop: '5%', width: '100%' }}>
          <Button
            type="default"
            title="Signin"
            onPress={handleSignin}
            loading={loading || isSubmitting}
            disabled={loading || isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  logo: {
    height: 160,
    width: 160,
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputField: {
    width: '100%',
  },
  keyboardAvoid: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },
});