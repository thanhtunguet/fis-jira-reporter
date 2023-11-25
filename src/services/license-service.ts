import {onValue, ref} from 'firebase/database';
import {Service} from 'react3l';
import {firstValueFrom} from 'rxjs';
import {database} from 'src/config/database';
import {jiraRepository} from 'src/repositories/jira-repository';
import {LicenseStatus} from 'src/types/LicenseStatus';

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

  public async checkForLicenseStatus(
    username: string,
    users: Users,
  ): Promise<LicenseStatus> {
    const lowercaseUsername: string = username.toLowerCase();

    if (!Object.prototype.hasOwnProperty.call(users, lowercaseUsername)) {
      return LicenseStatus.UNLICENSED;
    }

    const expiredDate: Date = new Date(users[lowercaseUsername]);
    const now: Date = await firstValueFrom(jiraRepository.getDate());

    if (now.getTime() >= expiredDate.getTime()) {
      return LicenseStatus.EXPIRED;
    }

    return LicenseStatus.VALID;
  }
}

export const licenseService: LicenseService = new LicenseService();
