import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loadFeedbacks } from '@/redux/slices/feedbackSlice';
import { useEffect } from 'react';

export function useReduxHouse() {
  const dispatch = useAppDispatch();
  const { feedbacks, loading, error } = useAppSelector((state) => state.feedback);

  const reload = () => dispatch(loadFeedbacks());

  useEffect(() => {
    dispatch(loadFeedbacks());
  }, []);

  return { feedbacks, loading, error, reload };
}
