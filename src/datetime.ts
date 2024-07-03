export const numberToDateString = (num: number): string => {
  const date = new Date(num * 86400000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(2);
  return `${day}/${month}/${year}`;
};

export const numberToMonthString = (num: number): string => {
  const year = Math.floor(num / 12);
  const month = num % 12;
  return `${month + 1}/${year}`;
};

export const numberToYearString = (num: number): string => {
  return num.toString();
};

const dateStringToNumbers = (date: string): [number, number, number] => {
  const parts = date.trim().split(" ");
  const day = parseInt(parts[0]);
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ].indexOf(parts[1]);
  const year = parseInt(parts[2]);
  return [day, month, year];
};

export const isDateString = (date: string): boolean => {
  const [day, month, year] = dateStringToNumbers(date);
  const isDayValid = !isNaN(day) && day >= 1 && day <= 31;
  const isMonthValid = !isNaN(month) && month >= 0 && month <= 11;
  const isYearValid = !isNaN(year) && year >= 0;
  return isDayValid && isMonthValid && isYearValid;
};

export const dateStringToDayNumber = (date: string): number => {
  const [day, month, year] = dateStringToNumbers(date);
  const time = Date.UTC(year, month, day);
  return time / 86400000;
};

export const dateStringToMonthNumber = (date: string): number => {
  const [, month, year] = dateStringToNumbers(date);
  return year * 12 + month;
};

export const dateStringToYearNumber = (date: string): number => {
  const [, , year] = dateStringToNumbers(date);
  return year;
};
