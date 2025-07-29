// @/hooks/useReduxMembers.ts
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loadUsers } from "@/redux/slices/userSlice";
import { useCallback, useEffect, useState } from "react";

export function useReduxMembers() {
  const dispatch = useAppDispatch();
  const { users: members, loading, error } = useAppSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(loadUsers()).unwrap();
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (loading && members.length === 0 ) {
      const timeout = setTimeout(() => {
        reload();
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [members, loading, reload]);

  return { 
    members, 
    loading: loading || refreshing, 
    error, 
    reload 
  };
}