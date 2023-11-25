import React from 'react';
import type {Component} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';
import {captureException} from '@sentry/react';
import {finalize} from 'rxjs';

export function useComponents(projectId: string): [
  Component[], //
  boolean,
] {
  const [components, setComponents] = React.useState<Component[]>([]);

  const [isComponentLoading, setIsComponentLoading] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    if (projectId) {
      setIsComponentLoading(true);
      jiraRepository
        .components(projectId)
        .pipe(
          finalize(() => {
            setIsComponentLoading(false);
          }),
        )
        .subscribe({
          next: (componentList) => {
            setComponents(componentList);
          },
          error: (error) => {
            captureException(error);
          },
        });
    }
  }, [projectId]);

  return [
    components, //
    isComponentLoading,
  ];
}
