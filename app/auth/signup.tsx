import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


export default function SignUpScreen() {
  return (
    <>
          <ThemedView style={styles.container}>
            <ThemedText type="title">SignUp Screen</ThemedText>
            <ThemedText type="default">
              This is a sign up screen for directors
            </ThemedText>
          </ThemedView>
        </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  
});
