// hooks/useReduxTasks.ts
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loadTasks } from "@/redux/slices/taskSlice";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { useEffect, useCallback } from "react";

export function useReduxTasks({ onlyCurrentUser = false } = {}) {
  const dispatch = useAppDispatch();
  const { tasks, status, error } = useAppSelector((state) => state.task);
  const currentUser = useAppSelector(selectCurrentUser);

  const reload = useCallback(() => {
    dispatch(loadTasks());
  }, [dispatch]);

  useEffect(() => {
    if (status === 'idle') {
      reload();
    }
  }, [status, reload]);

  const loading = status === 'loading';
  
  // Filter tasks for current user using userId
  const filteredTasks = onlyCurrentUser && currentUser
    ? tasks.filter(task => task.userId === currentUser.id)
    : tasks;

  return { 
    tasks: filteredTasks, 
    loading, 
    error, 
    reload, 
    status 
  };
}