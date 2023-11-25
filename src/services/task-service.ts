import {Service} from 'react3l';
import type {RuleObject} from 'rc-field-form/lib/interface';
import type {SimpleTask} from 'src/types/SimpleTask';
import type {JiraForm} from 'src/models/jira-form';
import {firstValueFrom} from 'rxjs';
import {jiraRepository} from 'src/repositories/jira-repository';
import type {Component, Project, User} from 'src/models';

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

  public readonly createTasks = async (
    form: JiraForm,
    index: number,
    user: User,
    project: Project,
    component: Component,
  ) => {
    const {reporter, typeOfWork, phase} = form;
    const {description, date} = form.tasks[index];

    const task = await firstValueFrom(
      jiraRepository.task(
        user.name,
        reporter,
        project,
        component,
        date,
        description,
      ),
    );

    await firstValueFrom(
      jiraRepository.createWorkLog(
        task,
        description,
        phase,
        user,
        date,
        typeOfWork,
      ),
    );

    await firstValueFrom(jiraRepository.complete(task));
  };
}

export const taskService = new TaskService();
