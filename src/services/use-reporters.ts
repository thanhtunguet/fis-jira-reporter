import React from 'react';
import {firstValueFrom} from 'rxjs';
import type {User} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';

export function useReporters(): [
  User[], //
  (username: string) => void,
] {
  const [reporters, setReporters] = React.useState<User[]>([]);

  const handleSearchReporter = React.useCallback(async (username: string) => {
    await firstValueFrom(jiraRepository.searchUser(username))
      //
      .then(({users = []}) => {
        setReporters(users);
      });
  }, []);

  return [reporters, handleSearchReporter];
}
