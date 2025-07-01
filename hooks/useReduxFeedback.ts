// hooks/useReduxFeedback.ts
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loadFeedbacks } from "@/redux/slices/feedbackSlice";
import { useEffect, useCallback } from "react";

export function useReduxFeedback() {
  const dispatch = useAppDispatch();
  
  const { feedbacks, status, error } = useAppSelector(
    (state) => state.feedback
  );

  const reload = useCallback(() => {
    dispatch(loadFeedbacks());
  }, [dispatch]);

  useEffect(() => {
    if (status === 'idle') {
      reload();
    }
  }, [status, reload]);

  const loading = status === 'loading';
  
  return { 
    feedbacks, 
    loading, 
    error, 
    reload,
    status
  };
}