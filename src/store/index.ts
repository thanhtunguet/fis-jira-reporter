import {configureStore} from '@reduxjs/toolkit';
import {ObjectField} from 'react3l';
import type {Store} from 'redux';
import logger from 'redux-logger';
import {userSlice, UserState} from './slices/user-slice';

export const store: Store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
  middleware: [
    logger, //
  ],
  devTools: true,
  enhancers: [],
});

export class GlobalState {
  @ObjectField(UserState)
  user: UserState;
}
