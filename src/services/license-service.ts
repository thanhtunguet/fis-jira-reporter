import {onValue, ref} from 'firebase/database';
import {Service} from 'react3l';
import {firstValueFrom} from 'rxjs';
import {database} from 'src/config/database';
import {jiraRepository} from 'src/repositories/jira-repository';
import {LicenseStatus} from 'src/types/license-status';

export type Users = Record<string, string>;

class LicenseService extends Service {
  public async getUsers(): Promise<Users> {
    return new Promise<Users>((resolve) => {
      const starCountRef = ref(database, 'users');
      onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        resolve(data);
      });
    });
  }

  public async getLicenseStatus(
    username: string,
    users: Users,
  ): Promise<LicenseStatus> {
    const lowercaseUsername: string = username.toLowerCase();

    if (!Object.prototype.hasOwnProperty.call(users, lowercaseUsername)) {
      return LicenseStatus.UNLICENSED;
    }

    const expiredTimeString = users[lowercaseUsername];
    const expiredTime = new Date(expiredTimeString);
    const now = await firstValueFrom(jiraRepository.getDate());

    if (now.getTime() >= expiredTime.getTime()) {
      return LicenseStatus.EXPIRED;
    }

    return LicenseStatus.VALID;
  }
}

export const licenseService: LicenseService = new LicenseService();
