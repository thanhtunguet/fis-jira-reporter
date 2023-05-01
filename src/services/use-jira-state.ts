import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import type {Component, Phase, Project, TypeOfWork} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';
import type {GlobalState} from 'src/store';
import {jiraSlice} from 'src/store/slices/jira-slice';

const {
  setProjects,
  setComponents,
  setPhases,
  setReporter,
  setTypeOfWork,
  selectProject,
  selectComponent,
  selectPhase,
} = jiraSlice.actions;

export function useJiraState(): [
  Project[],
  string | undefined,
  (id: string) => void,
  Component[],
  string | undefined,
  (id: string) => void,
  Phase[],
  number | undefined,
  (id: number) => void,
  string,
  (username: string) => void,
  TypeOfWork,
  (typeOfWork: TypeOfWork) => void,
] {
  const {
    projects,
    selectedProject,
    components,
    selectedComponent,
    phases,
    selectedPhase,
    reporter,
    typeOfWork,
  } = useSelector((state: GlobalState) => state.jira);

  const dispatch = useDispatch();

  React.useEffect(() => {
    jiraRepository.projects().subscribe({
      next: (listProjects) => {
        dispatch(setProjects(listProjects));
      },
    });
  }, [dispatch]);

  React.useEffect(() => {
    if (selectedProject) {
      jiraRepository.components(selectedProject).subscribe({
        next: (listComponents) => {
          dispatch(setComponents(listComponents));
        },
      });
    }
  }, [selectedProject, dispatch]);

  React.useEffect(() => {
    if (selectedProject && selectedComponent) {
      jiraRepository.phases(selectedProject).subscribe({
        next: (listPhases) => {
          dispatch(setPhases(listPhases));
        },
      });
    }
  }, [selectedProject, selectedComponent, dispatch]);

  const handleSelectProject = React.useCallback(
    (projectId: string) => {
      dispatch(selectProject(projectId));
    },
    [dispatch],
  );

  const handleSelectComponent = React.useCallback(
    (componentId: string) => {
      dispatch(selectComponent(componentId));
    },
    [dispatch],
  );

  const handleSelectPhase = React.useCallback(
    (phaseId: number) => {
      dispatch(selectPhase(phaseId));
    },
    [dispatch],
  );

  const handleChangeReporter = React.useCallback(
    (username: string) => {
      dispatch(setReporter(username));
    },
    [dispatch],
  );

  const handleChangeTypeOfWork = React.useCallback(
    (selectedTypeOfWork: TypeOfWork) => {
      dispatch(setTypeOfWork(selectedTypeOfWork));
    },
    [dispatch],
  );

  return [
    projects,
    selectedProject,
    handleSelectProject,
    components,
    selectedComponent,
    handleSelectComponent,
    phases,
    selectedPhase,
    handleSelectPhase,
    reporter,
    handleChangeReporter,
    typeOfWork,
    handleChangeTypeOfWork,
  ];
}
