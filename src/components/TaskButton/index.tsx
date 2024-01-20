import classNames from 'classnames';
import type {ReactElement} from 'react';
import {useSelector} from 'react-redux';
import type {GlobalState} from 'src/store';
import {store} from 'src/store';
import {jiraSlice} from 'src/store/slices/jira-slice';

const {setIsVisible} = jiraSlice.actions;

export function TaskButton(): ReactElement {
  const {isLoading} = useSelector((state: GlobalState) => state.user);

  return (
    <a
      role="button"
      href="#"
      onClick={() => {
        store.dispatch(setIsVisible(true));
      }}
      aria-disabled={isLoading}
      id="fis_jira_automation_create_tasks_button"
      className={classNames(
        'aui-button aui-button-primary aui-style aui-button-primary mx-2',
      )}
      title="Create tasks using extension">
      <span>{isLoading ? 'Checking for license' : 'Tasks'}</span>
    </a>
  );
}

export interface TaskButtonProps {
  //
}

TaskButton.defaultProps = {
  //
};

export default TaskButton;
