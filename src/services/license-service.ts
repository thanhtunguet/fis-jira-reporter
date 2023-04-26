import {onValue, ref} from 'firebase/database';
import moment from 'moment';
import {Service} from 'react3l';
import {firstValueFrom} from 'rxjs';
import {database} from 'src/config/database';
import {jiraRepository} from 'src/repositories/jira-repository';

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

  public async hasLicense(username: string, users: Users): Promise<boolean> {
    const lowercaseUsername: string = username.toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(users, lowercaseUsername)) {
      return false;
    }
    const expiredTimeString = users[lowercaseUsername];
    const expiredTime = moment(expiredTimeString);
    const now = await firstValueFrom(jiraRepository.getDate());
    return now.toDate().getTime() < expiredTime.toDate().getTime();
  }
}

export const licenseService: LicenseService = new LicenseService();
