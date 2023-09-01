import {configureStore} from '@reduxjs/toolkit';
import {ObjectField} from 'react3l';
import type {Store} from 'redux';
import logger from 'redux-logger';
import {JiraState, jiraSlice} from './slices/jira-slice';
import {UserState, userSlice} from './slices/user-slice';

export const store: Store = configureStore({
  reducer: {
    jira: jiraSlice.reducer,
    user: userSlice.reducer,
  },
  middleware: [
    logger, //
  ],
  devTools: true,
  enhancers: [],
});

export class GlobalState {
  @ObjectField(JiraState)
  jira: JiraState;

  @ObjectField(UserState)
  user: UserState;
}
