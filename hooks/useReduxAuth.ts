import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login, logoutAsync, updateUser, setUser } from '@/redux/slices/authSlice';
import type { User } from '@/redux/slices/authSlice';
import { purgePersistedAuth } from '@/services/authService';

export function useReduxAuth() {
  const dispatch = useAppDispatch();

  const auth = useAppSelector((state) => state?.auth ?? {});

  const {
    user = null,
    isAuthenticated = false,
    loading = false,
    error = null,
    expoPushToken = null,
  } = auth;

  const signin = (email: string, password: string) =>
    dispatch(login({ email, password }));

  const signout = async () => {
  await purgePersistedAuth();       
  dispatch(logoutAsync());         
};

  const updateCurrentUser = (userData: Partial<User>) => {
    dispatch(updateUser(userData));
  };

  const setUserData = (userData: { user: User; expoPushToken?: string }) => {
    dispatch(setUser(userData));
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    expoPushToken,
    signin,
    signout,
    updateCurrentUser,
    setUser: setUserData,
  };
}
