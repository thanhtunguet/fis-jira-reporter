import {Service} from 'react3l';
import type {RuleObject} from 'rc-field-form/lib/interface';
import type {SimpleTask} from 'src/types/SimpleTask';
import type {JiraForm} from 'src/models/jira-form';
import {sleep} from 'src/helpers/sleep';

class TaskService extends Service {
  public readonly validateTasks = async (
    rule: RuleObject,
    value: SimpleTask[] | undefined,
  ) => {
    if (value instanceof Array) {
      if (value.length > 0) {
        return;
      }
    }
    throw new Error('Missing tasks');
  };

  public readonly createTasks = async (form: JiraForm, index: number) => {
    const task = form.tasks[index];
    await sleep(300);
  };
}

export const taskService = new TaskService();
