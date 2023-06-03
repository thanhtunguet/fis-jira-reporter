import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';
import {Field, Model, ObjectList} from 'react3l';
import {Phase} from 'src/models';
import {Project, Component} from 'src/models';
import {TypeOfWork} from 'src/models';

export class JiraState extends Model {
  @ObjectList(Project)
  projects: Project[];

  @Field(String)
  selectedProject?: string;

  @ObjectList(Component)
  components: Component[];

  @Field(String)
  selectedComponent?: string;

  @ObjectList(Phase)
  phases: Phase[];

  @Field(Number)
  selectedPhase?: number;

  @Field(String)
  reporter?: string;

  @Field(String)
  typeOfWork?: TypeOfWork;

  @Field(Boolean)
  visible: boolean;
}

const initialState: JiraState = {
  projects: [],
  components: [],
  phases: [],
  typeOfWork: TypeOfWork.Create,
  visible: false,
};

export const jiraSlice = createSlice({
  name: 'jira',
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<Project[]>) {
      state.projects = action.payload;
      state.components = [];
      state.selectedComponent = undefined;
      state.selectedProject = undefined;
      state.phases = [];
      state.selectedPhase = undefined;
    },
    setComponents(state, action: PayloadAction<Component[]>) {
      state.components = action.payload;
      state.selectedComponent = undefined;
      state.phases = [];
      state.selectedPhase = undefined;
    },
    setPhases(state, action: PayloadAction<Phase[]>) {
      state.phases = action.payload;
      state.selectedPhase = undefined;
    },
    selectProject(state, action: PayloadAction<string | undefined>) {
      state.selectedProject = action.payload;
      state.selectedComponent = undefined;
      state.selectedPhase = undefined;
    },
    selectComponent(state, action: PayloadAction<string | undefined>) {
      state.selectedComponent = action.payload;
      state.selectedPhase = undefined;
    },
    selectPhase(state, action: PayloadAction<number | undefined>) {
      state.selectedPhase = action.payload;
    },
    setReporter(state, action: PayloadAction<string>) {
      state.reporter = action.payload;
    },
    setTypeOfWork(state, action: PayloadAction<TypeOfWork | undefined>) {
      state.typeOfWork = action.payload;
    },
    toggleModal(state) {
      state.visible = !state.visible;
    },
  },
});
