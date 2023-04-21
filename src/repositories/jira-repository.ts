import { Repository } from "react3l";
import { JIRA_HOST } from "src/config/consts";

class JiraRepository extends Repository {
  constructor() {
    super();
    this.baseURL = new URL("", JIRA_HOST).href;
  }

  async getCookie() {
    const cookie = await chrome.cookies.get({
      url: JIRA_HOST,
      name: "JSESSIONID",
    });
    return cookie.value;
  }

  async get<T>(url: string): Promise<T> {
    const cookie = await this.getCookie();
    const response = await fetch(new URL(url, JIRA_HOST).href, {
      method: "GET",
      headers: {
        cookie: `JSESSIONID=${cookie}`,
      },
    });
    const body: T = await response.json();
    console.log(body);
    return body;
  }

  async post<T>(url: string, data: any): Promise<T> {
    const cookie = await this.getCookie();

    const response = await fetch(new URL(url, JIRA_HOST).href, {
      method: "POST",
      body: data,
      headers: {
        cookie: `JSESSIONID=${cookie}`,
      },
    });
    const body: T = await response.json();
    console.log(body);
    return body;
  }

  async projects() {
    return this.get<Project[]>("/rest/api/2/project");
  }

  async authSession() {
    return this.get<JiraAuthResponse>("/rest/auth/1/session");
  }

  async components(projectId: string) {
    return this.get<Component[]>(`/rest/api/2/project/${projectId}/components`);
  }
}

export const jiraRepository = new JiraRepository();
