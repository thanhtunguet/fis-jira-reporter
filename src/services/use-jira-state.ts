import React from 'react';
import type {Component, Phase, Project, TypeOfWork} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';

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
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [selectedProjectKey, setSelectedProjectKey] =
    React.useState<string>('');

  const [components, setComponents] = React.useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = React.useState<
    string | undefined
  >();

  const [phases, setPhases] = React.useState<Phase[]>([]);
  const [selectedPhase, setSelectedPhase] = React.useState<
    number | undefined
  >();

  const [selectedReporter, setSelectedReporter] = React.useState<
    string | undefined
  >();

  const [selectedTypeOfWork, setSelectedTypeOfWork] = React.useState<
    TypeOfWork | undefined
  >();

  React.useEffect(() => {
    jiraRepository.projects().subscribe({
      next: (listProjects) => {
        setProjects(listProjects);
      },
    });
  }, []);

  React.useEffect(() => {
    if (selectedProjectKey) {
      jiraRepository.components(selectedProjectKey).subscribe({
        next: (listComponents) => {
          setComponents(listComponents);
        },
      });
    }
  }, [selectedProjectKey]);

  React.useEffect(() => {
    if (selectedProjectKey && selectedComponent) {
      jiraRepository.phases(selectedProjectKey).subscribe({
        next: (listPhases) => {
          setPhases(listPhases);
        },
      });
    }
  }, [selectedProjectKey, selectedComponent]);

  return [
    projects,
    selectedProjectKey,
    setSelectedProjectKey,
    components,
    selectedComponent,
    setSelectedComponent,
    phases,
    selectedPhase,
    setSelectedPhase,
    selectedReporter,
    setSelectedReporter,
    selectedTypeOfWork,
    setSelectedTypeOfWork,
  ];
}
