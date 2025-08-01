// services/authService.ts
import { persistor } from "@/redux/store";

export const purgePersistedAuth = async () => {
  try {
    await persistor.purge();
    return true;
  } catch {
    throw new Error("Failed to clear persisted state");
  }
};
