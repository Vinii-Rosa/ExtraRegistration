import moment from 'moment';

export function calculateMinutes(start_time: string, end_time: string) {
  const start = moment(start_time, 'HH:mm', true);
  const end = moment(end_time, 'HH:mm', true);

  let minutes = end.diff(start, 'minutes');
  if (minutes < 0) minutes += 24 * 60;

  return minutes;
}

export function calculateExtraValue(start_time: string, end_time: string, hourly_value: number) {
  const minutes = calculateMinutes(start_time, end_time);

  return Math.round((minutes * hourly_value) / 60);
}
