import React from 'react';
import type {Component, Project} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';
import {finalize} from 'rxjs';

export function useComponents(
  selectedProject?: string,
): [Component[], boolean] {
  const [components, setComponents] = React.useState<Component[]>([]);

  const [componentLoading, setComponentLoading] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    if (selectedProject) {
      setComponentLoading(true);
      jiraRepository
        .components(selectedProject)
        .pipe(
          finalize(() => {
            setComponentLoading(false);
          }),
        )
        .subscribe({
          next: (loadedComponents) => setComponents(loadedComponents),
        });
    }
  }, [selectedProject]);

  return [components, componentLoading];
}
