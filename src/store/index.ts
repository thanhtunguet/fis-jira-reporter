import {configureStore} from '@reduxjs/toolkit';
import type {Store} from 'redux';
import type {JiraState} from './slices/jira-slice';
import {jiraSlice} from './slices/jira-slice';

export const store: Store = configureStore({
  reducer: {
    jira: jiraSlice.reducer,
  },
});

export interface GlobalState {
  jira: JiraState;
}
