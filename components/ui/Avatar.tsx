import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import { ThemedView } from '../ThemedView';
import { Image } from 'expo-image';
import { ThemedText } from '../ThemedText';
import { useRouter, usePathname } from 'expo-router';
import { useReduxAuth } from '@/hooks/useReduxAuth';

type AvatarProps = {
  size?: number;
};

export function Avatar({ size = 40 }: AvatarProps) {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const navigation = useRouter();
  const pathname = usePathname();
  const { user, signout } = useReduxAuth();

  useEffect(() => {
    if (!user) {
      navigation.replace('/auth/login');
    }
  }, [user, navigation]);

  const getInitial = () => {
    const displayName = user?.name || 'U';
    return displayName.trim().charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await signout();
      setPopoverVisible(false); // Close modal before navigation
      navigation.replace('/auth/login');
    } catch (error: any) {
      console.error('Logout Error:', error);
      Alert.alert('Logout Failed', 'An error occurred during logout.');
    }
  };

  if (!user) {
    return null; // Return null during render to avoid errors
  }

  const shouldShowModal = popoverVisible && !pathname.includes('profile');

  return (
    <>
      <TouchableOpacity
        onPress={() => setPopoverVisible(true)}
        activeOpacity={0.7}
      >
        <ThemedView
          style={[
            styles.container,
            { height: size, width: size, borderRadius: size / 2 },
          ]}
        >
          {user.image ? (
            <Image
              source={{ uri: user.image }}
              style={{
                height: size,
                width: size,
                borderRadius: size / 2,
              }}
            />
          ) : (
            <ThemedView
              style={[
                styles.initialContainer,
                { height: size, width: size, borderRadius: size / 2 },
              ]}
            >
              <ThemedText
                type="default"
                style={[styles.initial, { fontSize: size * 0.5 }]}
              >
                {getInitial()}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </TouchableOpacity>

      <Modal
        visible={shouldShowModal}
        transparent
        animationType="none"
        onRequestClose={() => setPopoverVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setPopoverVisible(false)}
        >
          <ThemedView style={styles.popover}>
            <Pressable
              style={styles.button}
              onPress={() => {
                navigation.push('/profile');
                setPopoverVisible(false);
              }}
            >
              <ThemedText type="default">Profile</ThemedText>
            </Pressable>
            <Pressable style={styles.button} onPress={handleLogout}>
              <ThemedText type="default">Logout</ThemedText>
            </Pressable>
          </ThemedView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  popover: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    minWidth: 200,
    elevation: 5,
    shadowColor: 'rgba(0, 0, 0, 0.03)',
    alignItems: 'flex-start',
    marginTop: 70,
    marginRight: 15,
  },
  button: {
    paddingVertical: 5,
    width: '100%',
  },
});