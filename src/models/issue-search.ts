import {Field, Model} from 'react3l';

export interface IssueSearchResponse {
  expand: string;

  startAt: number;

  maxResults: number;

  total: number;

  issues: Issue[];
}

export class Issue extends Model {
  @Field(String)
  expand: string;

  @Field(String)
  id: string;

  @Field(String)
  self: string;

  @Field(String)
  key: string;

  fields: Fields2;
}

export interface Fields2 {
  customfield_13100?: any;

  customfield_13102?: any;

  fixVersions: FixVersion[];

  customfield_13101?: any;

  customfield_11200?: any;

  customfield_10111?: any;

  customfield_13500?: any;

  resolution?: any;

  customfield_11201?: any;

  customfield_10112?: any;

  customfield_10113?: any;

  customfield_11202?: string;

  customfield_10114?: Customfield10114;

  customfield_10500: string;

  customfield_10104?: any;

  customfield_10105?: any;

  customfield_10501?: any;

  customfield_10502?: any;

  customfield_10106?: any;

  customfield_10107?: any;

  customfield_10108?: any;

  customfield_10901?: any;

  customfield_10109?: any;

  lastViewed?: any;

  customfield_12000?: any;

  priority: Priority;

  customfield_10100?: any;

  customfield_12400?: any;

  customfield_10101?: any;

  customfield_10102?: any;

  labels: any[];

  customfield_10103?: string;

  customfield_11700?: any;

  versions: FixVersion[];

  issuelinks: (Issuelink | Issuelinks2 | Issuelinks3)[];

  assignee?: Assignee;

  status: Status;

  components: Component[];

  customfield_11300?: any;

  customfield_11301?: any;

  customfield_10324?: any;

  customfield_10325?: any;

  customfield_10601?: any;

  customfield_12901?: any;

  customfield_12900?: any;

  customfield_12903?: any;

  customfield_12902?: any;

  creator: Assignee;

  subtasks: any[];

  reporter: Assignee;

  customfield_10320?: any;

  customfield_10321?: any;

  customfield_10322?: any;

  customfield_10323?: any;

  customfield_12500?: any;

  customfield_13306?: any;

  customfield_11402?: any;

  customfield_13305?: any;

  customfield_10315?: any;

  customfield_10316?: any;

  customfield_10317?: any;

  customfield_10318?: any;

  customfield_10319?: any;

  votes: Votes;

  issuetype: Issuetype2;

  project: Project;

  customfield_11000?: any;

  customfield_13302?: any;

  customfield_10310?: any;

  customfield_13301?: any;

  customfield_10311?: any;

  customfield_13304?: any;

  customfield_11400?: any;

  customfield_13303?: any;

  customfield_10302?: any;

  customfield_12602?: any;

  customfield_10303?: any;

  customfield_12601?: any;

  customfield_10700?: any;

  customfield_10304?: any;

  customfield_10305?: any;

  customfield_10306?: string;

  customfield_10307?: any;

  resolutiondate?: any;

  customfield_10309?: any;

  workratio: number;

  watches: Watches;

  created: string;

  customfield_12201?: any;

  customfield_12600?: any;

  customfield_10301?: any;

  customfield_11902?: any;

  updated: string;

  customfield_13001?: any;

  description?: string;

  customfield_10130?: any;

  customfield_13002?: any;

  customfield_13401?: Customfield13401;

  customfield_13400?: string;

  customfield_13402?: Customfield10114;

  customfield_10126?: any;

  customfield_12701?: any;

  customfield_10402?: any;

  customfield_10127?: any;

  security: ProjectCategory;

  customfield_10128?: any;

  customfield_12703?: any;

  customfield_10129?: string;

  customfield_10404?: any;

  customfield_10800?: any;

  customfield_12702?: any;

  customfield_10405?: any;

  customfield_10406?: any;

  customfield_10407?: any;

  summary: string;

  customfield_10120?: string;

  customfield_10000?: any;

  customfield_10121?: Customfield10114;

  customfield_10001?: any;

  customfield_10122?: any;

  customfield_10123?: any;

  customfield_12300?: any;

  customfield_10124?: any;

  customfield_10125?: any;

  customfield_10400?: any;

  customfield_10115?: any;

  customfield_10116?: any;

  environment?: any;

  customfield_10118?: string;

  customfield_10119?: string;

  duedate: string;
}

export interface Customfield13401 {
  self: string;

  value: string;

  id: string;

  child: Customfield10114;
}

export interface Watches {
  self: string;

  watchCount: number;

  isWatching: boolean;
}

export interface Project {
  self: string;

  id: string;

  key: string;

  name: string;

  avatarUrls: AvatarUrls;

  projectCategory: ProjectCategory;
}

export interface ProjectCategory {
  self: string;

  id: string;

  description: string;

  name: string;
}

export interface Issuetype2 {
  self: string;

  id: string;

  description: string;

  iconUrl: string;

  name: string;

  subtask: boolean;

  avatarId?: number;
}

export interface Votes {
  self: string;

  votes: number;

  hasVoted: boolean;
}

export interface Component {
  self: string;

  id: string;

  name: string;
}

export interface Assignee {
  self: string;

  name: string;

  key: string;

  emailAddress: string;

  avatarUrls: AvatarUrls;

  displayName: string;

  active: boolean;

  timeZone: string;
}

export interface AvatarUrls {
  '48x48': string;

  '24x24': string;

  '16x16': string;

  '32x32': string;
}

export interface Issuelinks3 {
  id: string;

  self: string;

  type: Type;

  outwardIssue?: InwardIssue;

  inwardIssue?: InwardIssue;
}

export interface Issuelinks2 {
  id: string;

  self: string;

  type: Type;

  outwardIssue: InwardIssue;
}

export interface Issuelink {
  id: string;

  self: string;

  type: Type;

  inwardIssue: InwardIssue;
}

export interface InwardIssue {
  id: string;

  key: string;

  self: string;

  fields: Fields;
}

export interface Fields {
  summary: string;

  status: Status;

  priority: Priority;

  issuetype: Issuetype;
}

export interface Issuetype {
  self: string;

  id: string;

  description: string;

  iconUrl: string;

  name: string;

  subtask: boolean;
}

export interface Status {
  self: string;

  description: string;

  iconUrl: string;

  name: string;

  id: string;

  statusCategory: StatusCategory;
}

export interface StatusCategory {
  self: string;

  id: number;

  key: string;

  colorName: string;

  name: string;
}

export interface Type {
  id: string;

  name: string;

  inward: string;

  outward: string;

  self: string;
}

export interface Priority {
  self: string;

  iconUrl: string;

  name: string;

  id: string;
}

export interface Customfield10114 {
  self: string;

  value: string;

  id: string;
}

export interface FixVersion {
  self: string;

  id: string;

  name: string;

  archived: boolean;

  released: boolean;

  releaseDate: string;
}
