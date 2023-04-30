import React from 'react';
import type {Project} from 'src/models/models';
import {jiraRepository} from 'src/repositories/jira-repository';
import {finalize} from 'rxjs';

export function useProjects(): [Project[], boolean] {
  const [projects, setProjects] = React.useState<Project[]>([]);

  const [projectLoading, setProjectLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    setProjectLoading(true);
    jiraRepository
      .projects()
      .pipe(
        finalize(() => {
          setProjectLoading(false);
        }),
      )
      .subscribe({
        next: (loadedProjects) => {
          setProjects(loadedProjects);
        },
      });
  }, []);

  return [projects, projectLoading];
}
