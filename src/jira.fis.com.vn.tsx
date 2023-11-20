import React from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {Provider, useSelector} from 'react-redux';
import {useUser} from './services/use-user';
import type {GlobalState} from './store';
import {persistor, store} from './store';
import * as Sentry from '@sentry/react';
import {LicenseStatus} from 'src/types/license-status';
import NoLicenseComponent from 'src/components/NoLicenseComponent';
import {SENTRY_DSN} from 'src/config/secrets';
import {PersistGate} from 'redux-persist/integration/react';
import TaskModal from 'src/modules/TaskModal';
import TaskButton from 'src/components/TaskButton';

Sentry.init({
  dsn: SENTRY_DSN,
});

const JiraApp: React.FC = () => {
  const [user, , licenseStatus] = useUser();
  const isVisible = useSelector((state: GlobalState) => state.jira.isVisible);

  React.useEffect(() => {
    if (user) {
      document.body.classList.add(user.name.toLowerCase());
    }
  }, [user]);

  if (licenseStatus !== LicenseStatus.VALID) {
    return <NoLicenseComponent />;
  }

  // TODO: valid license
  return <TaskModal isOpen={isVisible} />;
};

// Inject "Tasks" button
const ul: Element = document.querySelectorAll('.aui-nav.__skate')[0];
const li: HTMLLIElement = document.createElement('li');
ul.appendChild(li);

const liRoot: Root = createRoot(li);
liRoot.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <TaskButton />
      <JiraApp />
    </PersistGate>
  </Provider>,
);
