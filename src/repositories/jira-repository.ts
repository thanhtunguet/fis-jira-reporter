import type {Moment} from 'moment';
import {Field, Model, ObjectList, Repository} from 'react3l';
import type {Observable} from 'rxjs';
import {map} from 'rxjs';
import {JIRA_HOST} from '../config/consts';
import '../config/repository';
import type {TypeOfWork} from '../models';
import {Component, Phase, Project, Task, User} from '../models';
import moment from 'moment/moment';
import type {IssueSearchResponse} from 'src/models/issue-search';

class SearchUserResponse extends Model {
  @Field(String)
  public footer: string;

  @Field(Number)
  public total: number;

  @ObjectList(User)
  public users: User[];
}

export class JiraRepository extends Repository {
  public constructor() {
    super();
    this.baseURL = JIRA_HOST;
  }

  public projects(): Observable<Project[]> {
    return this.http
      .get('/rest/api/2/project')
      .pipe(Repository.responseMapToList<Project>(Project));
  }

  public getIssuesInCurrentYear(
    projectId: string,
  ): Observable<IssueSearchResponse> {
    const currentYear = moment().startOf('year').format('YYYY-MM-DD');
    const jql = `project = ${projectId} AND due >= "${currentYear}" ORDER BY due DESC`;
    return this.http
      .get('/rest/api/2/search', {
        params: {
          jql,
        },
      })
      .pipe(Repository.responseDataMapper<IssueSearchResponse>());
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

  public authSession(): Observable<User> {
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

  public getDate(): Observable<Date> {
    return this.http.get('/secure/Dashboard.jspa').pipe(
      map((response) => {
        return new Date(response.headers.date);
      }),
    );
  }

  public searchUser(username: string): Observable<SearchUserResponse> {
    return this.http
      .get('/rest/api/1.0/users/picker', {
        params: {
          showAvatar: true,
          query: username,
        },
      })
      .pipe(
        Repository.responseMapToModel<SearchUserResponse>(SearchUserResponse),
      );
  }
}

export const jiraRepository = new JiraRepository();
