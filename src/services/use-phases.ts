import React from 'react';
import type {Phase} from 'src/models/models';
import {jiraRepository} from 'src/repositories/jira-repository';
import {finalize} from 'rxjs';

export function usePhases(selectedProject?: string): [Phase[], boolean] {
  const [phases, setPhases] = React.useState<Phase[]>([]);
  const [phaseLoading, setPhaseLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (selectedProject) {
      setPhaseLoading(true);
      jiraRepository
        .phases(selectedProject)
        .pipe(
          finalize(() => {
            setPhaseLoading(false);
          }),
        )
        .subscribe({
          next: (loadedPhases) => setPhases(loadedPhases),
        });
    }
  }, [selectedProject]);

  return [phases, phaseLoading];
}
