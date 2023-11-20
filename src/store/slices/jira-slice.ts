import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';
import {Field, Model} from 'react3l';

export class JiraState extends Model {
  @Field(Boolean)
  isVisible?: boolean;
}

const initialState: JiraState = {
  isVisible: false,
};

export const jiraSlice = createSlice({
  name: 'jira',
  initialState,
  reducers: {
    setIsVisible(state, action: PayloadAction<boolean>) {
      state.isVisible = action.payload;
    },
  },
});
