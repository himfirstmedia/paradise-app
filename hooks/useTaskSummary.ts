// hooks/useTaskSummary.ts
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { loadTaskSummary } from "@/redux/slices/taskSlice";
import { useEffect, useCallback } from "react";

export function useTaskSummary() {
  const dispatch = useAppDispatch();
  const { summary, summaryStatus, error } = useAppSelector((state) => state.task);
  const currentUser = useAppSelector(selectCurrentUser);
  
  
  const loadSummary = useCallback(() => {
    if (currentUser?.id) {
      dispatch(loadTaskSummary(currentUser.id));
    }
  }, [dispatch, currentUser?.id]);


  useEffect(() => {
    if (summaryStatus === "idle") {
      loadSummary();
    }
  }, [summaryStatus, loadSummary]);


  const reload = useCallback(() => {
    if (currentUser?.id) {
      dispatch(loadTaskSummary(currentUser.id));
    }
  }, [dispatch, currentUser?.id]);

  const summaryLoading = summaryStatus === "loading";

  return {
    summary,
    summaryLoading,
    summaryStatus,
    error,
    reload, 
    hasSummary: !!summary, 
  };
}