import { onValue, ref } from "firebase/database";
import moment from "moment";
import { Service } from "react3l";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import { database } from "../database";
import { jiraRepository } from "../repositories/jira-repository";

export type Users = Record<string, string>;

export const users = new BehaviorSubject<Users>({});

class LicenseService extends Service {
  async getUsers(): Promise<Users> {
    return new Promise((resolve) => {
      const starCountRef = ref(database, "users");
      onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        resolve(data);
        users.next(data);
      });
    });
  }

  async hasLicense(u: string): Promise<boolean> {
    const username = u.toLowerCase();
    const currentUsers = users.getValue();
    if (!Object.prototype.hasOwnProperty.call(currentUsers, username)) {
      return false;
    }
    const time = currentUsers[username];
    const m = moment(time);
    const now = await firstValueFrom(jiraRepository.getDate());
    return now.toDate().getTime() < m.toDate().getTime();
  }
}

export const licenseService = new LicenseService();
