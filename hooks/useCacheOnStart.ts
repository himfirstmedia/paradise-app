import AsyncStorage from "@react-native-async-storage/async-storage";

type Fetcher<T> = () => Promise<T>;

interface CacheItem<T> {
  key: string;
  fetcher: Fetcher<T>;
}

export async function cacheOnStart<T = any>(items: CacheItem<T>[]) {
  try {
    await Promise.all(
      items.map(async ({ key, fetcher }) => {
        const cached = await AsyncStorage.getItem(key);
        if (!cached) {
          const remoteData = await fetcher();
          await AsyncStorage.setItem(key, JSON.stringify(remoteData));
        } else {
          // Optional: log or skip if already cached
          console.log(`Using cached data for key: ${key}`);
        }
      })
    );
    return { loading: false, error: null };
  } catch (error: any) {
    return { loading: false, error };
  }
}

