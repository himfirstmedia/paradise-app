// hooks/useTaskSummary.ts
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { loadChoreSummary } from "@/redux/slices/choreSlice";
import { useCallback, useEffect } from "react";

export function useChoreSummary() {
  const dispatch = useAppDispatch();
  const { summary, summaryStatus, error } = useAppSelector((state) => state.task);
  const currentUser = useAppSelector(selectCurrentUser);
  
  
  const loadSummary = useCallback(() => {
    if (currentUser?.id) {
      dispatch(loadChoreSummary(currentUser.id));
    }
  }, [dispatch, currentUser?.id]);


  useEffect(() => {
    if (summaryStatus === "idle") {
      loadSummary();
    }
  }, [summaryStatus, loadSummary]);


  const reload = useCallback(() => {
    if (currentUser?.id) {
      dispatch(loadChoreSummary(currentUser.id));
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