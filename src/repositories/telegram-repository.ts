import {Repository} from 'react3l';
import {TELE_BOT_TOKEN, TELE_CHAT_ID} from 'src/config/secrets';
import type {Observable} from 'rxjs';

export class TelegramRepository extends Repository {
  constructor() {
    super({
      baseURL: `https://api.telegram.org/bot${TELE_BOT_TOKEN}`,
    });
  }

  public sendMessage(message: string): Observable<void> {
    return this.http
      .post('/sendMessage', {
        chat_id: TELE_CHAT_ID,
        text: message,
      })
      .pipe(Repository.responseDataMapper());
  }
}

export const telegramRepository = new TelegramRepository();
