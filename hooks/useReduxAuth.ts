import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { login, logoutAsync, updateUser } from "@/redux/slices/authSlice";
import type { User } from "@/redux/slices/authSlice";

export function useReduxAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const signin = (email: string, password: string) =>
    dispatch(login({ email, password }));

  const signout = () => dispatch(logoutAsync());

  const updateCurrentUser = (userData: Partial<User>) => {
    dispatch(updateUser(userData));
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    signin,
    signout,
    updateCurrentUser,
  };
}
