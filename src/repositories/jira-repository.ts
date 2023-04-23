import { Repository } from "react3l";
import { Observable } from "rxjs";
import { JIRA_HOST } from "../config/consts";
import { Component, Phase, Project, Task, TypeOfWork, User } from "../models";
import { Moment } from "moment";

Repository.requestInterceptor = async function (config) {
  const cookie = await chrome.cookies.get({
    url: JIRA_HOST,
    name: "JSESSIONID",
  });
  config.headers.cookie = `JSESSIONID=${cookie.value}`;
  return config;
};

export class JiraRepository extends Repository {
  constructor() {
    super();
    this.baseURL = JIRA_HOST;
  }

  projects(): Observable<Project[]> {
    return this.http
      .get("/rest/api/2/project")
      .pipe(Repository.responseMapToList<Project>(Project));
  }

  components(projectId: string): Observable<Component[]> {
    return this.http
      .get(`/rest/api/2/project/${projectId}/components`)
      .pipe(Repository.responseMapToList<Component>(Component));
  }

  phases(projectId: string): Observable<Phase[]> {
    return this.http
      .get(`/rest/fis-project-detail/1.0/phaseWorklogByCate/${projectId}`)
      .pipe(Repository.responseMapToList<Phase>(Phase));
  }

  authSession(): Observable<User> {
    return this.http
      .get(`/rest/auth/1/session`)
      .pipe(Repository.responseMapToModel<User>(User));
  }

  task(
    username: string,
    reporter: string,
    project: Project,
    component: Component,
    date: Moment,
    taskDescription: string
  ): Observable<Task> {
    return this.http
      .post(`/rest/api/2/issue`, {
        fields: {
          project: {
            id: project.id,
          },
          summary: `${username}_${date.format("YYYY_MM_DD")}_${project.key}`,
          issuetype: {
            id: "3", // Task
          },
          assignee: {
            name: username,
          },
          reporter: {
            name: reporter,
          },
          priority: {
            id: "2",
          },
          security: {
            id: "10200",
          },
          description: taskDescription,
          duedate: date.format("YYYY-MM-DD"),
          components: [
            {
              id: component.id,
            },
          ],
          customfield_10103: date.format("YYYY-MM-DD"),
          customfield_10306: "8",
        },
      })
      .pipe(Repository.responseMapToModel<Task>(Task));
  }

  worklog(
    task: Task,
    description: string,
    phase: Phase,
    user: User,
    date: Moment,
    typeOfWork: TypeOfWork
  ) {
    return this.http
      .get("/rest/fis-worklog/1.0/createWorkLog", {
        params: {
          issueKey: task.key,
          userKey: user.name,
          userName: user.name,
          period: "false",
          startDate: date.toDate().getTime(),
          endDate: date.toDate().getTime(),
          workPerDay: 8,
          typeOfWork: typeOfWork,
          desc: description,
          ot: false,
          type: "gantt",
          phaseWorklog: phase.id,
        },
      })
      .pipe(Repository.responseDataMapper());
  }

  complete(task: Task) {
    return this.http
      .post(`/rest/api/2/issue/${task.id}/transitions`, {
        transition: {
          id: "21",
        },
      })
      .pipe(Repository.responseDataMapper());
  }
}

export const jiraRepository = new JiraRepository();
