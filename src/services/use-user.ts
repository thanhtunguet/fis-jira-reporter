import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {concatMap, finalize} from 'rxjs';
import type {User} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';
import {licenseService} from 'src/services/license-service';
import {userSelector} from 'src/store/selectors';
import {userSlice} from 'src/store/slices/user-slice';

export function useUser(): [User, boolean, boolean] {
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
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
              dispatch(userSlice.actions.setUser(loggedUser));
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
            error: (error) => {
              // eslint-disable-next-line no-console
              console.error(error);
            },
          });
      });
  }, [dispatch]);

  return [user, loading, isValidLicense];
}
