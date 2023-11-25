import React from 'react';
import {firstValueFrom} from 'rxjs';
import type {User} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';

export function useReporters(): [
  User[], //
  (username: string) => Promise<void>,
  boolean,
  string | undefined,
  (username: string) => Promise<void>,
] {
  const [reporters, setReporters] = React.useState<User[]>([]);
  const [isSearchingReporter, setIsSearchingReporter] =
    React.useState<boolean>(false);

  const [selectedReporter, setSelectedReporter] = React.useState<
    string | undefined
  >(undefined);

  const handleSearchReporter = React.useCallback(
    (username: string): Promise<void> => {
      setIsSearchingReporter(true);
      return (
        firstValueFrom(jiraRepository.searchUser(username))
          //
          .then(({users, total}) => {
            console.log(users);
            if (total === 0) {
              setReporters([]);
              return;
            }
            setReporters(users);
          })
          .finally(() => {
            setIsSearchingReporter(false);
          })
      );
    },
    [],
  );

  const handleSelectReporter = React.useCallback(async (username: string) => {
    setSelectedReporter(username);
  }, []);

  return [
    reporters,
    handleSearchReporter,
    isSearchingReporter,
    selectedReporter,
    handleSelectReporter,
  ];
}
