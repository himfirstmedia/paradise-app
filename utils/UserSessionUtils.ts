import AsyncStorage from "@react-native-async-storage/async-storage";
import StorageParams from "../constants/StorageParams";

export class UserSessionUtils {
  // ───── TOKEN MANAGEMENT ─────

  static async getBearerToken(): Promise<string | null> {
    return await AsyncStorage.getItem(StorageParams.ACCESS_TOKEN);
  }

  static async setBearerToken(token: string | null): Promise<void> {
    if (token) {
      await AsyncStorage.setItem(StorageParams.ACCESS_TOKEN, token);
    } else {
      await AsyncStorage.removeItem(StorageParams.ACCESS_TOKEN);
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(StorageParams.REFRESH_TOKEN);
  }

  static async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(StorageParams.REFRESH_TOKEN, token);
  }

  // ───── USER DETAILS ─────

  static async setUserDetails(userData: {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  role: string;
  house?: string | null;
  city: string;
  state: string;
  zipCode: string;
  image?: string | null;
  joinedDate?: string | null;
  leavingDate?: string | null;
  password: string;
  feedback?: any[];
  task?: any[];
}): Promise<void> {
  await AsyncStorage.setItem(
    StorageParams.USER_DETAILS_JSON,
    JSON.stringify(userData)
  );
}

  static async getUserDetails(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(StorageParams.USER_DETAILS_JSON);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("User details parse error:", error);
      return null;
    }
  }

  // ───── LOGIN STATUS ─────

  static async isLoggedIn(): Promise<boolean> {
    const status = await AsyncStorage.getItem(StorageParams.IS_LOGGED_IN);
    return status === "true";
  }

  static async setLoggedIn(status: boolean): Promise<void> {
    await AsyncStorage.setItem(StorageParams.IS_LOGGED_IN, status.toString());
  }

  // ───── LOGOUT ─────

  static async logout(): Promise<void> {
    await AsyncStorage.clear();
  }

  // ───── LANGUAGE & COUNTRY ─────

  static async setUserLanguage(language: string): Promise<void> {
    await AsyncStorage.setItem(
      StorageParams.LANGUAGE,
      JSON.stringify(language)
    );
  }

  static async getUserLanguage(): Promise<string | null> {
    const value = await AsyncStorage.getItem(StorageParams.LANGUAGE);
    return value ? JSON.parse(value) : null;
  }

  static async setUserCountry(country: any): Promise<void> {
    await AsyncStorage.setItem(StorageParams.COUNTRY, JSON.stringify(country));
  }

  static async getUserCountry(): Promise<any | null> {
    const value = await AsyncStorage.getItem(StorageParams.COUNTRY);
    return value ? JSON.parse(value) : null;
  }

  // ───── LAST SYNCED DATA ─────

  static async setLastSynced(key: string): Promise<void> {
    await AsyncStorage.setItem(`@last_synced_${key}`, Date.now().toString());
  }

  static async getLastSynced(key: string): Promise<number | null> {
    const val = await AsyncStorage.getItem(`@last_synced_${key}`);
    return val ? parseInt(val, 10) : null;
  }
}
