import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {Model, ObjectField} from 'react3l';
import type {Store} from 'redux';
import logger from 'redux-logger';
import {userSlice, UserState} from './slices/user-slice';
import {persistReducer, persistStore} from 'redux-persist';
import type {PersistConfig} from 'redux-persist/es/types';
import {jiraSlice, JiraState} from 'src/store/slices/jira-slice';

const persistConfig: PersistConfig<GlobalState> = {
  key: 'root',
  storage: {
    getItem<T>(key: string): Promise<T> {
      return new Promise<T>((resolve) => {
        chrome.storage.sync.get((items) => {
          resolve(items[key] as T);
        });
      });
    },
    setItem(key: string, value: any): Promise<void> {
      return chrome.storage.sync.set({
        [key]: value,
      });
    },
    removeItem(key: string): Promise<void> {
      return chrome.storage.sync.remove(key);
    },
  },
};

const rootReducer = combineReducers({
  user: userSlice.reducer,
  jira: jiraSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store: Store = configureStore({
  reducer: persistedReducer,
  middleware: [
    logger, //
  ],
  devTools: true,
  enhancers: [],
});

export const persistor = persistStore(store);

export class GlobalState extends Model {
  @ObjectField(UserState)
  user: UserState;

  @ObjectField(JiraState)
  jira: JiraState;
}
