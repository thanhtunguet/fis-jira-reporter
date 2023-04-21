enum ProjectStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  COMPLETED = "completed",
}

class Project {
  id: string;
  key: string;
  name: string;
  description?: string;
  status: ProjectStatus;
}

enum ComponentAssigneeType {
  PROJECT_LEAD = "projectLead",
  UNASSIGNED = "unassigned",
}

class Component {
  id: string;
  name: string;
  description?: string;
  leadUserName?: string;
  assigneeType: ComponentAssigneeType;
  projectId: string;
}

interface TypeOfWork {
  name: string;
  description?: string;
}

enum PhaseStatus {
  TO_DO = "toDo",
  IN_PROGRESS = "inProgress",
  DONE = "done",
}

class Phase {
  id: string;
  name: string;
  description?: string;
  status: PhaseStatus;
  projectId: string;
  componentId?: string;
  typeOfWork?: TypeOfWork;
}

class JiraAuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  scope: string;
  accountId: string;
  userName: string;
  displayName: string;
  email: string;

  constructor(
    accessToken: string,
    tokenType: string,
    expiresIn: number,
    refreshToken: string,
    scope: string,
    accountId: string,
    userName: string,
    displayName: string,
    email: string
  ) {
    this.accessToken = accessToken;
    this.tokenType = tokenType;
    this.expiresIn = expiresIn;
    this.refreshToken = refreshToken;
    this.scope = scope;
    this.accountId = accountId;
    this.userName = userName;
    this.displayName = displayName;
    this.email = email;
  }
}
