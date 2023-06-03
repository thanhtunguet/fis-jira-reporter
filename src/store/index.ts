import {configureStore} from '@reduxjs/toolkit';
import type {Store} from 'redux';
import {JiraState} from './slices/jira-slice';
import {jiraSlice} from './slices/jira-slice';
import {UserState} from './slices/user-slice';
import {userSlice} from './slices/user-slice';
import {ObjectField} from 'react3l';

export const store: Store = configureStore({
  reducer: {
    jira: jiraSlice.reducer,
    user: userSlice.reducer,
  },
});

export class GlobalState {
  @ObjectField(JiraState)
  jira: JiraState;

  @ObjectField(UserState)
  user: UserState;
}
