import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useCallback, useEffect } from "react";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { loadChores } from "../redux/slices/choreSlice";

export function useReduxChores({ onlyCurrentUser = false } = {}) {
  const dispatch = useAppDispatch();
  const { chores, choresStatus, error } = useAppSelector((state) => state.chore);
  const currentUser = useAppSelector(selectCurrentUser);

  const reload = useCallback(() => {
    dispatch(loadChores());
  }, [dispatch]);

  useEffect(() => {
    if (choresStatus === "idle") {
      reload();
    }
  }, [choresStatus, reload]);

  const loading = choresStatus === "loading";

  const currentChoreId = currentUser?.currentChore?.id ?? currentUser?.currentChoreId;

const filteredChores = onlyCurrentUser && currentChoreId
  ? chores.filter((chore) => chore.id === currentChoreId)
  : chores;


  return {
    chores: filteredChores,
    loading,
    error,
    reload,
    choresStatus,
  };
}
