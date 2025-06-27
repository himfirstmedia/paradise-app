import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loadScriptures } from "@/redux/slices/scriptureSlice";
import { useEffect } from "react";

export function useReduxScripture() {
  const dispatch = useAppDispatch();
  const { scriptures, loading, error } = useAppSelector(
    (state) => state.scripture
  );

  const reload = () => dispatch(loadScriptures());

  useEffect(() => {
    dispatch(loadScriptures());
  }, []);

  return { scriptures, loading, error, reload };
}
