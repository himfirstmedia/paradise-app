import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login, logoutAsync, updateUser, setUser } from '@/redux/slices/authSlice';
import type { User } from '@/redux/slices/authSlice';

export function useReduxAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error, expoPushToken } = useAppSelector((state) => state.auth);

  const signin = (email: string, password: string) =>
    dispatch(login({ email, password }));

  const signout = () => dispatch(logoutAsync());

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