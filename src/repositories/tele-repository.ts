import {Repository} from 'react3l';
import {TELE_BOT_TOKEN, TELE_CHAT_ID} from 'src/config/secrets';

export class TeleRepository extends Repository {
  constructor() {
    super({
      baseURL: `https://api.telegram.org/bot${TELE_BOT_TOKEN}`,
    });
  }

  sendMessage(message: string) {
    return this.http
      .post('/sendMessage', {
        chat_id: TELE_CHAT_ID,
        text: message,
      })
      .pipe(Repository.responseDataMapper());
  }
}

export const teleRepository = new TeleRepository();
