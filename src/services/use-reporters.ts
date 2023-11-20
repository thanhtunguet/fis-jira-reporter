import React from 'react';
import {firstValueFrom} from 'rxjs';
import type {User} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';

export function useReporters(): [
  User[], //
  (username: string) => Promise<void>,
  boolean,
] {
  const [reporters, setReporters] = React.useState<User[]>([]);
  const [isSearchingReporter, setIsSearchingReporter] =
    React.useState<boolean>(false);

  const handleSearchReporter = React.useCallback(
    (username: string): Promise<void> => {
      setIsSearchingReporter(true);
      return (
        firstValueFrom(jiraRepository.searchUser(username))
          //
          .then(({users = []}) => {
            setReporters(users);
          })
          .finally(() => {
            setIsSearchingReporter(false);
          })
      );
    },
    [],
  );

  return [reporters, handleSearchReporter, isSearchingReporter];
}
