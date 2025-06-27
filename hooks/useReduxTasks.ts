import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loadTasks } from "@/redux/slices/taskSlice";
import { useEffect } from "react";

export function useReduxTasks() {
  const dispatch = useAppDispatch();
  const {
    tasks,
    loading,
    error,
  } = useAppSelector((state) => state.task);

  const reload = () => dispatch(loadTasks());

  useEffect(() => {
    dispatch(loadTasks());
  }, []);

  return { tasks, loading, error, reload };
}
