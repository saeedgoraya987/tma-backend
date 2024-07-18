export const getRandomDate = (start: Date, end: Date): Date => {
  const startTimestamp = start.getTime();
  const endTimestamp = end.getTime();
  const randomTimestamp =
    Math.random() * (endTimestamp - startTimestamp) + startTimestamp;
  return new Date(randomTimestamp);
};

export const getMonthDifference = (date1: Date, date2: Date): number => {
  const yearsDifference = date2.getFullYear() - date1.getFullYear();
  const monthsDifference = date2.getMonth() - date1.getMonth();
  return yearsDifference * 12 + monthsDifference;
};
