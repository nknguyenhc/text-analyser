import {
  dateStringToDayNumber,
  dateStringToMonthNumber,
  dateStringToYearNumber,
  numberToDateString,
  numberToMonthString,
  numberToYearString,
} from "./datetime";

type Record = {
  [key: string]: number;
};

type NumberRecord = {
  [key: number]: number;
};

export type FrequencyRecord = {
  name: string;
  count: number;
};

type TextFrequencies = {
  days: FrequencyRecord[];
  months: FrequencyRecord[];
  years: FrequencyRecord[];
};

type AnalyserResult = {
  success: boolean;
  error?: string;
  result?: {
    textCounts: Record;
    textGroupCounts: Record;
    textFrequencies: TextFrequencies;
  };
};

const analyse = (filename: string, text: string): AnalyserResult => {
  const doc = document.createElement("div");
  doc.innerHTML = text;
  const allMessages = Array.from(doc.querySelectorAll(".message.default"));
  if (allMessages.length === 0) {
    return {
      success: false,
      error: `No messages found in the file ${filename}`,
    };
  }

  const textCounts: Record = {};
  const textGroupCounts: Record = {};
  let currName = undefined;
  for (const message of allMessages) {
    const classList = Array.from(message.classList);
    if (classList.includes("joined")) {
      if (currName) {
        textCounts[currName] = (textCounts[currName] || 0) + 1;
        continue;
      }
    }

    const name = message.querySelector(".from_name")?.textContent?.trim();
    if (name) {
      textCounts[name] = (textCounts[name] || 0) + 1;
      textGroupCounts[name] = (textGroupCounts[name] || 0) + 1;
      currName = name;
    }
  }

  const textFrequencies = getFrequency(doc);

  return {
    success: true,
    result: {
      textCounts,
      textGroupCounts,
      textFrequencies,
    },
  };
};

const getFrequency = (doc: HTMLDivElement): TextFrequencies => {
  const dayRecord: NumberRecord = {};
  const monthRecord: NumberRecord = {};
  const yearRecord: NumberRecord = {};

  const allMessages = Array.from(doc.querySelectorAll(".message"));
  let dayNumber = 0;
  let monthNumber = 0;
  let yearNumber = 0;
  for (const message of allMessages) {
    if (message.classList.contains("service")) {
      const timeString = (message as HTMLElement).innerText;
      dayNumber = dateStringToDayNumber(timeString);
      monthNumber = dateStringToMonthNumber(timeString);
      yearNumber = dateStringToYearNumber(timeString);
    } else {
      dayRecord[dayNumber] = (dayRecord[dayNumber] || 0) + 1;
      monthRecord[monthNumber] = (monthRecord[monthNumber] || 0) + 1;
      yearRecord[yearNumber] = (yearRecord[yearNumber] || 0) + 1;
    }
  }
  return {
    days: Object.entries(dayRecord)
      .sort(([time1], [time2]) => parseInt(time1) - parseInt(time2))
      .map(([time, count]) => ({
        name: numberToDateString(parseInt(time)),
        count,
      })),
    months: Object.entries(monthRecord)
      .sort(([time1], [time2]) => parseInt(time1) - parseInt(time2))
      .map(([time, count]) => ({
        name: numberToMonthString(parseInt(time)),
        count,
      })),
    years: Object.entries(yearRecord)
      .sort(([time1], [time2]) => parseInt(time1) - parseInt(time2))
      .map(([time, count]) => ({
        name: numberToYearString(parseInt(time)),
        count,
      })),
  };
};

export default analyse;
