import type {User} from 'src/models';

export function isGam(user?: User | null) {
  return (
    user?.name?.toLowerCase() === 'gamhth2' ||
    user?.name?.toLowerCase() === 'tungpt46'
  );
}
