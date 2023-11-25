import {Service} from 'react3l';
import dayjs from 'dayjs';
import {DATE_FORMAT} from 'src/config/consts';
import type {RuleObject} from 'rc-field-form/lib/interface';

class DateService extends Service {
  async validateCurrentDate(rule: RuleObject, value: dayjs.Dayjs) {
    if (!dayjs.isDayjs(value)) {
      throw new Error('Invalid date');
    }
    const now = dayjs();
    const startOfMonth = now.startOf('month');

    if (
      value.format(DATE_FORMAT) > now.format(DATE_FORMAT) ||
      value.format(DATE_FORMAT) < startOfMonth.format(DATE_FORMAT)
    ) {
      throw new Error('Date is out of range');
    }
  }
}

export const dateService = new DateService();
