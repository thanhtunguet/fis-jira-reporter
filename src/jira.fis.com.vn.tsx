import Modal from 'antd/es/modal';
import Spin from 'antd/es/spin';
import React from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {Provider, useDispatch, useSelector} from 'react-redux';
import NoLicense from 'src/markdown/no-license.md';
import {JiraForm} from './modules/jira-form/jira-form';
import {useUser} from './services/use-user';
import type {GlobalState} from './store';
import {store} from './store';
import {jiraSlice} from './store/slices/jira-slice';
import type {AnyAction, Dispatch} from 'redux';
import {localization} from 'react3l';

localization.initialize({
  lng: 'vi',
  fallbackLng: 'vi',
});

const JiraApp: React.FC = () => {
  const [user, loading, isValidLicense] = useUser();

  const visible: boolean = useSelector(
    (state: GlobalState) => state.jira.visible,
  );

  const dispatch: Dispatch<AnyAction> = useDispatch();

  const handleCloseModal = React.useCallback(() => {
    dispatch(jiraSlice.actions.toggleModal());
  }, [dispatch]);

  return (
    <>
      <Modal
        width={1080}
        closeIcon={<></>}
        open={visible}
        destroyOnClose={true}
        maskClosable={false}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}>
        <Spin tip="Checking for your license" spinning={loading}>
          {user && isValidLicense ? (
            <JiraForm
              open={visible}
              onCancel={handleCloseModal}
              onOk={handleCloseModal}
              maskClosable={false}
              closeIcon={<></>}
            />
          ) : (
            <NoLicense />
          )}
        </Spin>
      </Modal>
    </>
  );
};

const rootDiv: HTMLDivElement = document.createElement('div');
rootDiv.id = 'root';
document.body.appendChild(rootDiv);

const root: Root = createRoot(rootDiv);
root.render(
  <Provider store={store}>
    <JiraApp />
  </Provider>,
);

// Inject "Create tasks" button
const ul = document.querySelectorAll('.aui-nav.__skate')[0];
const li = document.createElement('li');
li.id = 'fis-jira-create-btn';
ul.appendChild(li);
const liRoot = createRoot(li);

liRoot.render(
  <a
    role="button"
    href="#"
    onClick={() => {
      store.dispatch(jiraSlice.actions.toggleModal());
    }}
    id="fis_jira_automation_create_tasks_button"
    className="aui-button aui-button-primary aui-style"
    title="Create tasks using extension">
    Create tasks
  </a>,
);
