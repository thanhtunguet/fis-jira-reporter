import type {User} from 'src/models';
import type {GlobalState} from '.';

export function userSelector(state: GlobalState): User | null {
  return state.user.user;
}
