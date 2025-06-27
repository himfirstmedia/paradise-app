import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loadUsers } from '@/redux/slices/userSlice';
import { useEffect } from 'react';

export function useReduxMembers() {
  const dispatch = useAppDispatch();
  const { users: members, loading, error } = useAppSelector((state) => state.user);

  const reload = () => dispatch(loadUsers());

  useEffect(() => {
    dispatch(loadUsers());
  }, []);

  return { members, loading, error, reload };
}