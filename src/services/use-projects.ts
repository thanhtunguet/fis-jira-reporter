import React from 'react';
import {finalize} from 'rxjs';
import type {Project} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';
import {captureException} from '@sentry/react';

export function useProjects(): [
  Project[], //
  boolean,
] {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    setIsLoadingProjects(true);
    jiraRepository
      .projects()
      .pipe(
        finalize(() => {
          setIsLoadingProjects(false);
        }),
      )
      .subscribe({
        next: (projectList) => {
          setProjects(projectList);
        },
        error: (error) => {
          captureException(error);
        },
      });
  }, []);

  return [projects, isLoadingProjects];
}
