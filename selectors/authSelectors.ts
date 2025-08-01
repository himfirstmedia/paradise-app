// selectors/authSelectors.ts
import { RootState } from "@/redux/types";
import { createSelector } from "@reduxjs/toolkit";

const selectAuth = (state: RootState) => state.auth;

export const selectUser = createSelector(
  [selectAuth],
  (auth) => auth.user
);
