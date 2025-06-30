import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loadUsers } from '@/redux/slices/userSlice';
import { useEffect, useRef } from 'react';

export function useReduxMembers() {
  const dispatch = useAppDispatch();
    const { users: members, loading, error } = useAppSelector((state) => state.user);
  
    // Use ref to track initial load
    const initialLoad = useRef(false);
  
    const reload = () => {
      dispatch(loadUsers());
    };
  
    useEffect(() => {
      if (!initialLoad.current && members.length === 0 && !loading) {
        initialLoad.current = true;
        dispatch(loadUsers());
      }
    }, [dispatch, members.length, loading]);

  return { members, loading, error, reload };
}