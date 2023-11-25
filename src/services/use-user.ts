import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {firstValueFrom} from 'rxjs';
import type {User} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';
import {licenseService} from 'src/services/license-service';
import {userSlice} from 'src/store/slices/user-slice';
import type {LicenseStatus} from 'src/types/LicenseStatus';
import * as Sentry from '@sentry/react';
import type {GlobalState} from 'src/store';

const {
  setUser,
  setIsLoading,
  setLicenseStatus, //
} = userSlice.actions;

export function useUser(): [
  User | null | undefined,
  boolean?,
  LicenseStatus?, //
] {
  const {
    user,
    isLoading,
    licenseStatus, //
  } = useSelector((state: GlobalState) => state.user);

  const dispatch = useDispatch();

  const handleCheckLicense = React.useCallback(async () => {
    dispatch(setIsLoading(true));

    try {
      const currentUser = await firstValueFrom(jiraRepository.authSession());
      dispatch(setUser(currentUser));
      const users = await licenseService.getUsers();
      const status = await licenseService.checkForLicenseStatus(
        currentUser.name,
        users,
      );

      dispatch(setLicenseStatus(status));
    } catch (error) {
      Sentry.captureException(error);
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch]);

  React.useEffect(() => {
    handleCheckLicense();
  }, [handleCheckLicense]);

  return [
    user,
    isLoading,
    licenseStatus, //
  ];
}
