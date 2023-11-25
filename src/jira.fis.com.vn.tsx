import React from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {useUser} from './services/use-user';
import {persistor, store} from './store';
import * as Sentry from '@sentry/react';
import {LicenseStatus} from 'src/types/license-status';
import NoLicenseComponent from 'src/components/NoLicenseComponent';
import {SENTRY_DSN} from 'src/config/secrets';
import {PersistGate} from 'redux-persist/integration/react';
import TaskModal from 'src/modules/TaskModal';
import TaskButton from 'src/components/TaskButton';
import {localization} from 'react3l';
import {AppLanguage} from 'src/types/AppLanguage';

Sentry.init({
  dsn: SENTRY_DSN,
});

const JiraApp: React.FC = () => {
  const [user, , licenseStatus] = useUser();

  React.useEffect(() => {
    if (user) {
      document.body.classList.add(user.name.toLowerCase());
    }
  }, [user]);

  if (licenseStatus !== LicenseStatus.VALID) {
    return <NoLicenseComponent />;
  }

  return <TaskModal />;
};

const li: HTMLLIElement = document.createElement('li');
const liRoot: Root = createRoot(li);
liRoot.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <TaskButton />
      <JiraApp />
    </PersistGate>
  </Provider>,
);

localization
  .initialize({
    lng: AppLanguage.VIETNAMESE,
    fallbackLng: AppLanguage.VIETNAMESE,
    ns: '',
    defaultNS: '',
    resources: {
      translations: {},
    },
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  })
  .then(async () => {
    localization.addLanguage(
      AppLanguage.VIETNAMESE,
      require('./locales/vi.json'),
    );
    localization.addLanguage(AppLanguage.ENGLISH, require('./locales/en.json'));
    await localization.changeLanguage(AppLanguage.VIETNAMESE);
    // Inject "Tasks" button
    const ul: Element | null = document.querySelector('ul.aui-nav.__skate');
    if (ul !== null) {
      ul.appendChild(li);
    }
  });
