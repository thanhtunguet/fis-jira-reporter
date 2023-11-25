import type {SimpleTask} from 'src/types/SimpleTask';

export class JiraForm {
  project: string;

  component: string;

  phase: number;

  typeOfWork: string;

  tasks: SimpleTask[];
}
