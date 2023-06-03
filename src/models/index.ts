import type {Moment} from 'moment';
import {Field, Model, MomentField, ObjectField} from 'react3l';

class LoginInfo extends Model {
  @Field(Number)
  failedLoginCount: number;

  @Field(Number)
  loginCount: number;

  @MomentField()
  lastFailedLoginTime: Moment;

  @MomentField()
  previousLoginTime: Moment;
}

export class User extends Model {
  @Field(String)
  self: string;

  @Field(String)
  name: string;

  @ObjectField(LoginInfo)
  loginInfo: LoginInfo;
}

class AvatarUrls extends Model {
  @Field(String)
  '48x48': string;

  @Field(String)
  '24x24': string;

  @Field(String)
  '16x16': string;

  @Field(String)
  '32x32': string;
}

class ProjectCategory extends Model {
  @Field(String)
  self: string;

  @Field(String)
  id: string;

  @Field(String)
  name: string;

  @Field(String)
  description: string;
}

export class Project extends Model {
  @Field(String)
  expand: string;

  @Field(String)
  self: string;

  @Field(String)
  id: string;

  @Field(String)
  key: string;

  @Field(String)
  name: string;

  @ObjectField(AvatarUrls)
  avatarUrls: AvatarUrls;

  @ObjectField(ProjectCategory)
  projectCategory: ProjectCategory;
}

export class Component extends Model {
  @Field(String)
  self: string;

  @Field(String)
  id: string;

  @Field(String)
  name: string;

  @Field(String)
  description: string;

  @Field(String)
  assigneeType: string;

  @Field(String)
  realAssigneeType: string;

  @Field(Boolean)
  isAssigneeTypeValid: boolean;

  @Field(String)
  project: string;

  @Field(Number)
  projectId: number;
}

export class Phase extends Model {
  @Field(Number)
  id: number;

  @Field(Number)
  categoryId: number;

  @Field(String)
  phaseValue: string;
}

export enum TypeOfWork {
  Create = 'Create',
  Correct = 'Correct',
  Study = 'Study',
  Review = 'Review',
  Test = 'Test',
}

export class TaskData {
  @MomentField()
  date: Moment;

  @Field(Number)
  weekNum: number;

  @Field(String)
  task: string;
}

export class Task extends Model {
  @Field(Number)
  id: number;

  @Field(String)
  key: string;
}
