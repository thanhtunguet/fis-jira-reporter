import type dayjs from 'dayjs';

export interface SimpleTask {
  index: number;

  date: dayjs.Dayjs;

  weekNumber: number;

  description: string;
}

export interface ExcelTask {
  index: number;

  date: number;

  weekNumber: number;

  description: string;
}
