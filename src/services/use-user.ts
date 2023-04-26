import React from 'react';
import type {User} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';
import {concatMap, finalize} from 'rxjs';
import type {Users} from 'src/services/license-service';
import {licenseService} from 'src/services/license-service';

export function useUser(): [User, boolean, boolean] {
  const [users, setUsers] = React.useState<Users>();

  const [user, setUser] = React.useState<User>(null);
  const [isValidLicense, setIsValidLicense] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    setLoading(true);
    licenseService
      .getUsers()
      .then((loadedUsers) => {
        setUsers(loadedUsers);
        return loadedUsers;
      })
      .then((loadedUsers) => {
        jiraRepository
          .authSession()
          .pipe(
            concatMap((loggedUser) => {
              setUser(loggedUser);
              return licenseService.hasLicense(loggedUser.name, loadedUsers);
            }),
          )
          .pipe(
            finalize(() => {
              setLoading(false);
            }),
          )
          .subscribe({
            next: (isValid) => {
              setIsValidLicense(isValid);
            },
            error: () => {
              //
            },
          });
      });
  }, []);

  return [user, loading, isValidLicense];
}
