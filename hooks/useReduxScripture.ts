import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loadScriptures } from "@/redux/slices/scriptureSlice";
import { useCallback, useEffect, useRef } from "react";

export function useReduxScripture() {
  const dispatch = useAppDispatch();
  const { scriptures, loading, error } = useAppSelector(
    (state) => state.scripture
  );

  const initialLoad = useRef(false);

  const reload = useCallback(() => {
    return dispatch(loadScriptures());
  }, [dispatch]);

  useEffect(() => {
    if (!initialLoad.current && scriptures.length === 0 && !loading) {
      initialLoad.current = true;
      dispatch(loadScriptures());
    }
  }, [dispatch, scriptures.length, loading]);

  return { scriptures, loading, error, reload };
}
