import type {User} from 'src/models';
import type {GlobalState} from '.';
import type {LicenseStatus} from 'src/types/license-status';

export function userSelector(state: GlobalState): User | null {
  return state.user.user;
}

export function userIsLoadingSelector(state: GlobalState): boolean {
  return state.user.isLoading;
}

export function licenseSelector(state: GlobalState): LicenseStatus {
  return state.user.licenseStatus;
}
