import dayjs from 'dayjs';

export function getNextWorkingDay(currentDate: dayjs.Dayjs) {
  // Ensure the input is a Day.js object
  if (!dayjs.isDayjs(currentDate)) {
    throw new Error('Input must be a valid Day.js object');
  }

  // Get the next day
  let nextWorkingDay = currentDate.add(1, 'day');

  // Check if the next working day is a weekend (Saturday or Sunday)
  if (nextWorkingDay.day() === 0) {
    // If it's Sunday, add one more day to get to Monday
    nextWorkingDay = nextWorkingDay.add(1, 'day');
  } else if (nextWorkingDay.day() === 6) {
    // If it's Saturday, add two days to get to Monday
    nextWorkingDay = nextWorkingDay.add(2, 'day');
  }
  return nextWorkingDay;
}
