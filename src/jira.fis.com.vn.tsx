import Modal from 'antd/es/modal';
import Spin from 'antd/es/spin';
import React from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {Provider, useDispatch, useSelector} from 'react-redux';
import NoLicense from 'src/markdown/no-license.md';
import './jira.scss';
import {JiraForm} from './modules/jira-form/jira-form';
import {useUser} from './services/use-user';
import type {GlobalState} from './store';
import {store} from './store';
import {jiraSlice} from './store/slices/jira-slice';

const JiraApp: React.FC = () => {
  const [user, loading, isValidLicense] = useUser();

  const visible = useSelector((state: GlobalState) => state.jira.visible);

  const dispatch = useDispatch();

  const handleCloseModal = React.useCallback(() => {
    dispatch(jiraSlice.actions.toggleModal());
  }, [dispatch]);

  if (user && isValidLicense) {
    return (
      <JiraForm
        width={1000}
        open={visible}
        closable={true}
        destroyOnClose={true}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}
      />
    );
  }

  return (
    <>
      <Modal
        width={1000}
        open={visible}
        closable={true}
        destroyOnClose={true}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}>
        <Spin tip="Checking for your license" spinning={loading}>
          <NoLicense />
        </Spin>
      </Modal>
    </>
  );
};

const rootDiv: HTMLDivElement = document.createElement('div');
rootDiv.id = 'jira-root-div';
document.body.appendChild(rootDiv);
const root: Root = createRoot(rootDiv);
root.render(
  <Provider store={store}>
    <JiraApp />
  </Provider>,
);

const ul = document.querySelectorAll('.aui-nav.__skate')[0];
const li = document.createElement('li');
li.id = 'fis-jira-create';
ul.appendChild(li);
const liRoot = createRoot(li);
liRoot.render(
  <a
    role="button"
    href="#"
    onClick={() => {
      store.dispatch(jiraSlice.actions.toggleModal());
    }}
    id="fis_create_tasks"
    className="aui-button aui-button-primary aui-style"
    title="Create tasks using extension">
    Create tasks
  </a>,
);
