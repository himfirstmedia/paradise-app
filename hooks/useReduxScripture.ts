import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loadScriptures } from "@/redux/slices/scriptureSlice";
import { useEffect, useRef } from "react";

export function useReduxScripture() {
  const dispatch = useAppDispatch();
  const { scriptures, loading, error } = useAppSelector(
    (state) => state.scripture
  );

  // Use ref to track initial load
  const initialLoad = useRef(false);

  const reload = () => {
    dispatch(loadScriptures());
  };

  useEffect(() => {
    if (!initialLoad.current && scriptures.length === 0 && !loading) {
      initialLoad.current = true;
      dispatch(loadScriptures());
    }
  }, [dispatch, scriptures.length, loading]);

  return { scriptures, loading, error, reload };
}