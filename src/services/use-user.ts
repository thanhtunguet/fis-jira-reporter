import React from 'react';
import {concatMap, finalize} from 'rxjs';
import type {User} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';
import {licenseService} from 'src/services/license-service';

export function useUser(): [User, boolean, boolean] {
  const [user, setUser] = React.useState<User>(null);
  const [isValidLicense, setIsValidLicense] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    setLoading(true);
    licenseService
      .getUsers()
      .then((loadedUsers) => {
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
            next: (isValid: boolean) => {
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
