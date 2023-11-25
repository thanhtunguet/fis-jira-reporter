import type {SimpleTask} from 'src/types/SimpleTask';
import type {TypeOfWork} from 'src/models/index';

export class JiraForm {
  project: string;

  component: string;

  phase: number;

  typeOfWork: TypeOfWork;

  tasks: SimpleTask[];

  reporter: string;
}
