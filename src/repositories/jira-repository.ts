import {Repository} from 'react3l';
import type {Observable} from 'rxjs';
import {map} from 'rxjs';
import {JIRA_HOST} from '../config/consts';
import type {TypeOfWork} from '../models';
import {Component, Phase, Project, Task, User} from '../models';
import type {Moment} from 'moment';
import moment from 'moment';
import '../config/repository';

export class JiraRepository extends Repository {
  constructor() {
    super();
    this.baseURL = JIRA_HOST;
  }

  public projects(): Observable<Project[]> {
    return this.http
      .get('/rest/api/2/project')
      .pipe(Repository.responseMapToList<Project>(Project));
  }

  public components(projectId: string): Observable<Component[]> {
    return this.http
      .get(`/rest/api/2/project/${projectId}/components`)
      .pipe(Repository.responseMapToList<Component>(Component));
  }

  public phases(projectId: string): Observable<Phase[]> {
    return this.http
      .get(`/rest/fis-project-detail/1.0/phaseWorklogByCate/${projectId}`)
      .pipe(Repository.responseMapToList<Phase>(Phase));
  }

  authSession(): Observable<User> {
    return this.http
      .get('/rest/auth/1/session')
      .pipe(Repository.responseMapToModel<User>(User));
  }

  public task(
    username: string,
    reporter: string,
    project: Project,
    component: Component,
    date: Moment,
    taskDescription: string,
  ): Observable<Task> {
    return this.http
      .post('/rest/api/2/issue', {
        fields: {
          project: {
            id: project.id,
          },
          summary: `${username}_${date.format('YYYY_MM_DD')}_${project.key}`,
          issuetype: {
            id: '3', // Task
          },
          assignee: {
            name: username,
          },
          reporter: {
            name: reporter,
          },
          priority: {
            id: '2',
          },
          security: {
            id: '10200',
          },
          description: taskDescription,
          duedate: date.format('YYYY-MM-DD'),
          components: [
            {
              id: component.id,
            },
          ],
          customfield_10103: date.format('YYYY-MM-DD'),
          customfield_10306: '8h',
        },
      })
      .pipe(Repository.responseMapToModel<Task>(Task));
  }

  public createWorkLog(
    task: Task,
    description: string,
    phase: Phase,
    user: User,
    date: Moment,
    typeOfWork: TypeOfWork,
  ) {
    return this.http
      .get('/rest/fis-worklog/1.0/createWorkLog', {
        params: {
          issueKey: task.key,
          userKey: user.name,
          userName: user.name,
          period: 'false',
          startDate: date.toDate().getTime(),
          endDate: date.toDate().getTime(),
          workPerDay: 8,
          typeOfWork: typeOfWork,
          desc: description,
          ot: false,
          type: 'gantt',
          phaseWorklog: phase.id,
        },
      })
      .pipe(Repository.responseDataMapper());
  }

  public complete(task: Task): Observable<void> {
    return this.http
      .post(`/rest/api/2/issue/${task.id}/transitions`, {
        transition: {
          id: '21',
        },
      })
      .pipe(Repository.responseDataMapper<void>());
  }

  public getDate(): Observable<Moment> {
    return this.http.get('/secure/Dashboard.jspa').pipe(
      map((response) => {
        return moment(response.headers.date);
      }),
    );
  }
}

export const jiraRepository = new JiraRepository();
