import type {FC} from 'react';
import React from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {JiraForm} from './modules/jira-form';
import {useUser} from './services/use-user';
import {store} from './store';
import {NoLicenseModal} from 'src/modules/no-license-modal';
import classNames from 'classnames';
import {ExclamationCircleOutlined} from '@ant-design/icons';
import {Spinner} from 'reactstrap';

interface JiraAppProps {
  isVisible: boolean;

  onCloseModal: () => void;
}

const JiraApp: React.FC<JiraAppProps> = ({
  isVisible,
  onCloseModal,
}: JiraAppProps) => {
  const [user, loading, isValidLicense] = useUser();

  React.useEffect(() => {
    if (user) {
      document.body.classList.add(user.name.toLowerCase());
    }
  }, [user]);

  if (isValidLicense) {
    return (
      <JiraForm
        isOpen={isVisible}
        onOk={onCloseModal}
        onCancel={onCloseModal}
      />
    );
  }

  return (
    <NoLicenseModal
      isOpen={isVisible}
      onOk={onCloseModal}
      onCancel={onCloseModal}
      loading={loading}
    />
  );
};

const ToggleButton: FC = () => {
  const [, loading, isValidLicense] = useUser();

  const [isVisible, setIsVisible] = React.useState<boolean>(false);

  const handleCloseModal = React.useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <>
      <a
        role="button"
        href="#"
        onClick={() => {
          setIsVisible(true);
        }}
        id="fis_jira_automation_create_tasks_button"
        className={classNames('aui-button aui-button-primary aui-style', {
          'aui-button-primary': isValidLicense,
          'aui-button-danger': !isValidLicense,
        })}
        title="Create tasks using extension">
        <span className="d-inline-flex align-items-center">
          <span>Create tasks</span>
          {loading && (
            <Spinner
              className="jira-primary-spinner mx-2"
              type="border"
              color="light"
              size={20}
            />
          )}
          {!loading && !isValidLicense && (
            <ExclamationCircleOutlined className="ml-2" />
          )}
        </span>
      </a>
      <JiraApp isVisible={isVisible} onCloseModal={handleCloseModal} />
    </>
  );
};

// Inject "Create tasks" button
const ul: Element = document.querySelectorAll('.aui-nav.__skate')[0];
const li: HTMLLIElement = document.createElement('li');
li.id = 'fis-jira-create-btn';
ul.appendChild(li);

const liRoot: Root = createRoot(li);
liRoot.render(
  <Provider store={store}>
    <ToggleButton />
  </Provider>,
);
