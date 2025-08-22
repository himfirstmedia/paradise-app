import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { loadChores, loadChoreSummary } from "@/redux/slices/choreSlice";
import { Chore } from "@/types/chore";
import { useCallback, useEffect } from "react";


export function useReduxChores({ onlyCurrentUser = false } = {}) {
  const dispatch = useAppDispatch();
  const { chores, choresStatus, error, summary, summaryStatus } = useAppSelector((state) => state.chore);
  const currentUser = useAppSelector(selectCurrentUser);

  const reload = useCallback(() => {
    dispatch(loadChores());
    if (currentUser?.id) {
      dispatch(loadChoreSummary(currentUser.id));
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (choresStatus === 'idle' && currentUser?.id) {
      reload();
    }
  }, [choresStatus, currentUser, reload]);

  const loading = choresStatus === 'loading';
  const filteredChores = onlyCurrentUser && currentUser
    ? chores.filter((chore: Chore) => chore.userId === currentUser.id)
    : chores;

  return {
    chores: filteredChores,
    loading,
    error,
    reload,
    choresStatus,
    summary,     
    summaryLoading: summaryStatus === 'loading',
  };
}
