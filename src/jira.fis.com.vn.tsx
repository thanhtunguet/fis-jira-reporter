import React from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {useUser} from './services/use-user';
import {store} from './store';
import classNames from 'classnames';
import * as Sentry from '@sentry/react';
import {Modal, ModalBody} from 'reactstrap';
import {LicenseStatus} from 'src/types/license-status';
import {Spin} from 'antd';
import {NoLicenseComponent} from 'src/components/NoLicenseComponent';

Sentry.init({
  dsn: 'https://ca838cedd3444e29a2d0678c48fada2a@sentry.truesight.asia/8',
});

const JiraApp: React.FC = () => {
  const [user, isLoading, licenseStatus] = useUser();

  React.useEffect(() => {
    if (user) {
      document.body.classList.add(user.name.toLowerCase());
    }
  }, [user]);

  if (isLoading) {
    return (
      <Modal isOpen={isLoading}>
        <ModalBody className="d-flex justify-content-center align-items-center">
          <Spin tip="Checking for your license" spinning={isLoading} />
        </ModalBody>
      </Modal>
    );
  }

  if (licenseStatus === LicenseStatus.VALID) {
    // TODO: valid license
    return <></>;
  }

  return <NoLicenseComponent />;
};

// Inject "Tasks" button
const ul: Element = document.querySelectorAll('.aui-nav.__skate')[0];
const li: HTMLLIElement = document.createElement('li');
const liRoot: Root = createRoot(li);

liRoot.render(
  <Provider store={store}>
    <a
      role="button"
      href="#"
      onClick={() => {
        // TODO: toggle modal
      }}
      id="fis_jira_automation_create_tasks_button"
      className={classNames(
        'aui-button aui-button-primary aui-style aui-button-primary',
      )}
      title="Create tasks using extension">
      <span>Tasks</span>
    </a>
    <JiraApp />
  </Provider>,
);

ul.appendChild(li);
