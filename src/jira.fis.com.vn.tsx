import * as Sentry from '@sentry/react';
import React from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {localization} from 'react3l';
import {PersistGate} from 'redux-persist/integration/react';
import TaskButton from 'src/components/TaskButton';
import {SENTRY_DSN} from 'src/config/secrets';
import TaskModal from 'src/modules/TaskModal';
import {AppLanguage} from 'src/types/AppLanguage';
import {useUser} from './services/use-user';
import {persistor, store} from './store';

Sentry.init({
  dsn: SENTRY_DSN,
});

const JiraApp: React.FC = () => {
  const [user] = useUser();

  React.useEffect(() => {
    if (user) {
      document.body.classList.add(user.name.toLowerCase());
    }
  }, [user]);

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
      require('./locales/en.json'),
    );
    localization.addLanguage(AppLanguage.ENGLISH, require('./locales/en.json'));
    await localization.changeLanguage(AppLanguage.ENGLISH);
    // Inject "Tasks" button
    const ul: Element | null = document.querySelector('ul.aui-nav.__skate');
    if (ul !== null) {
      ul.appendChild(li);
    }
  });
