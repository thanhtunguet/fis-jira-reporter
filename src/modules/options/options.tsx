//

import * as Sentry from '@sentry/react';
import {SENTRY_DSN} from 'src/config/secrets';

Sentry.init({
  dsn: SENTRY_DSN,
});
