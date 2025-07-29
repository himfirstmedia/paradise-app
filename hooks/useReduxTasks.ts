import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { loadTasks, loadTaskSummary } from "@/redux/slices/taskSlice";
import { useCallback, useEffect } from "react";


export function useReduxTasks({ onlyCurrentUser = false } = {}) {
  const dispatch = useAppDispatch();
  const { tasks, tasksStatus, error, summary, summaryStatus } = useAppSelector((state) => state.task);
  const currentUser = useAppSelector(selectCurrentUser);

  const reload = useCallback(() => {
    dispatch(loadTasks());
    if (currentUser?.id) {
      dispatch(loadTaskSummary(currentUser.id));
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (tasksStatus === 'idle' && currentUser?.id) {
      reload();
    }
  }, [tasksStatus, currentUser, reload]);

  const loading = tasksStatus === 'loading';
  const filteredTasks = onlyCurrentUser && currentUser
    ? tasks.filter(task => task.userId === currentUser.id)
    : tasks;

  return {
    tasks: filteredTasks,
    loading,
    error,
    reload,
    tasksStatus,
    summary,     
    summaryLoading: summaryStatus === 'loading',
  };
}
