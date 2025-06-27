import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loadHouses } from '@/redux/slices/houseSlice';
import { useEffect } from 'react';

export function useReduxHouse() {
  const dispatch = useAppDispatch();
  const { houses, loading, error } = useAppSelector((state) => state.house);

  const reload = () => dispatch(loadHouses());

  useEffect(() => {
    dispatch(loadHouses());
  }, []);

  return { houses, loading, error, reload };
}
