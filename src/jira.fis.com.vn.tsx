import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {JiraForm} from './modules/jira-form';
import {useUser} from './services/use-user';
import type {GlobalState} from './store';
import {store} from './store';
import {jiraSlice} from './store/slices/jira-slice';
import type {AnyAction, Dispatch} from 'redux';
import {NoLicenseModal} from 'src/modules/no-license-modal';
import classNames from 'classnames';
import {ExclamationCircleOutlined} from '@ant-design/icons';
import {Spinner} from 'reactstrap';

const JiraApp: React.FC = () => {
  const [user, loading, isValidLicense] = useUser();

  const visible: boolean = useSelector(
    (state: GlobalState) => state.jira.visible,
  );

  const dispatch: Dispatch<AnyAction> = useDispatch();

  const handleCloseModal = React.useCallback(() => {
    dispatch(jiraSlice.actions.toggleModal());
  }, [dispatch]);

  React.useEffect(() => {
    if (user) {
      document.body.classList.add(user.name.toLowerCase());
    }
  }, [user]);

  if (isValidLicense) {
    return (
      <JiraForm
        isOpen={visible}
        onOk={handleCloseModal}
        onCancel={handleCloseModal}
      />
    );
  }

  return (
    <NoLicenseModal
      isOpen={visible}
      onOk={handleCloseModal}
      onCancel={handleCloseModal}
      loading={loading}
    />
  );
};

function ToggleButton() {
  const [, loading, isValidLicense] = useUser();

  return (
    <a
      role="button"
      href="#"
      onClick={() => {
        store.dispatch(jiraSlice.actions.toggleModal());
      }}
      id="fis_jira_automation_create_tasks_button"
      className={classNames('aui-button aui-button-primary aui-style', {
        'aui-button-primary': isValidLicense,
        'aui-button-danger': !isValidLicense,
      })}
      title="Create tasks using extension">
      <span className="d-inline-flex align-items-center">
        Create tasks
        {loading && (
          <Spinner
            className="jira-primary-spinner ml-2"
            type="border"
            color="light"
          />
        )}
        {!loading && !isValidLicense && (
          <ExclamationCircleOutlined className="ml-2" />
        )}
      </span>
    </a>
  );
}

// Inject "Create tasks" button
const ul = document.querySelectorAll('.aui-nav.__skate')[0];
const li = document.createElement('li');
li.id = 'fis-jira-create-btn';
const liRoot = createRoot(li);
liRoot.render(
  <Provider store={store}>
    <ToggleButton />
    <JiraApp />
  </Provider>,
);

ul.appendChild(li);
