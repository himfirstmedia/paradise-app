import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loadHouses } from "@/redux/slices/houseSlice";
import { useCallback, useEffect, useRef } from "react";

export function useReduxHouse() {
  const dispatch = useAppDispatch();
  const { houses, loading, error } = useAppSelector((state) => state.house);

  // Use ref to track initial load
  const initialLoad = useRef(false);

  const reload = useCallback(() => {
    return dispatch(loadHouses());
  }, [dispatch]);

  useEffect(() => {
    if (!initialLoad.current && houses.length === 0 && !loading) {
      initialLoad.current = true;
      dispatch(loadHouses());
    }
  }, [dispatch, houses.length, loading]);

  return { houses, loading, error, reload };
}
