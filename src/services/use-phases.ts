import React from 'react';
import type {Phase} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';
import {captureException} from '@sentry/react';
import {finalize} from 'rxjs';

export function usePhases(projectId: string): [
  Phase[], //
  boolean,
] {
  const [phases, setPhases] = React.useState<Phase[]>([]);

  const [isPhaseLoading, setIsPhaseLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (projectId) {
      setIsPhaseLoading(true);
      jiraRepository
        .phases(projectId)
        .pipe(
          finalize(() => {
            setIsPhaseLoading(false);
          }),
        )
        .subscribe({
          next: (phaseList) => {
            setPhases(phaseList);
          },
          error: (error) => {
            captureException(error);
          },
        });
    }
  }, [projectId]);

  return [
    phases, //
    isPhaseLoading,
  ];
}
