import {
  dateStringToDayNumber,
  dateStringToMonthNumber,
  dateStringToYearNumber,
  isDateString,
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

export type FrequenciesRecord = {
  name: string;
  [key: string]: string;
};

type FrequenciesNumberRecord = {
  [key: number]: Record;
};

type Frequencies = {
  total: FrequencyRecord[];
  individual: FrequenciesRecord[];
};

type TextFrequencies = {
  days: Frequencies;
  months: Frequencies;
  years: Frequencies;
};

type AnalyserResult = {
  success: boolean;
  error?: string;
  result?: {
    textCounts: Record;
    textGroupCounts: Record;
    textFrequencies: TextFrequencies;
    names: string[];
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
      names: Object.keys(textCounts),
    },
  };
};

const dateDictToArray = (dict: NumberRecord): FrequencyRecord[] => {
  return Object.entries(dict)
    .sort(([time1], [time2]) => parseInt(time1) - parseInt(time2))
    .map(([time, count]) => ({
      name: numberToDateString(parseInt(time)),
      count,
    }));
};

const dateDictToFrequenciesArray = (
  dict: FrequenciesNumberRecord
): FrequenciesRecord[] => {
  return Object.entries(dict)
    .sort(([time1], [time2]) => parseInt(time1) - parseInt(time2))
    .map(([time, record]) => ({
      name: numberToDateString(parseInt(time)),
      ...record,
    }));
};

const monthDictToArray = (dict: NumberRecord): FrequencyRecord[] => {
  return Object.entries(dict)
    .sort(([time1], [time2]) => parseInt(time1) - parseInt(time2))
    .map(([time, count]) => ({
      name: numberToMonthString(parseInt(time)),
      count,
    }));
};

const monthDictToFrequenciesArray = (
  dict: FrequenciesNumberRecord
): FrequenciesRecord[] => {
  return Object.entries(dict)
    .sort(([time1], [time2]) => parseInt(time1) - parseInt(time2))
    .map(([time, record]) => ({
      name: numberToMonthString(parseInt(time)),
      ...record,
    }));
};

const yearDictToArray = (dict: NumberRecord): FrequencyRecord[] => {
  return Object.entries(dict)
    .sort(([time1], [time2]) => parseInt(time1) - parseInt(time2))
    .map(([time, count]) => ({
      name: numberToYearString(parseInt(time)),
      count,
    }));
};

const yearDictToFrequenciesArray = (
  dict: FrequenciesNumberRecord
): FrequenciesRecord[] => {
  return Object.entries(dict)
    .sort(([time1], [time2]) => parseInt(time1) - parseInt(time2))
    .map(([time, record]) => ({
      name: numberToYearString(parseInt(time)),
      ...record,
    }));
};

const getFrequency = (doc: HTMLDivElement): TextFrequencies => {
  const dayRecord: NumberRecord = {};
  const monthRecord: NumberRecord = {};
  const yearRecord: NumberRecord = {};
  const dayIndividualRecord: FrequenciesNumberRecord = {};
  const monthIndividualRecord: FrequenciesNumberRecord = {};
  const yearIndividualRecord: FrequenciesNumberRecord = {};

  const allMessages = Array.from(doc.querySelectorAll(".message"));
  let dayNumber = 0;
  let monthNumber = 0;
  let yearNumber = 0;
  let currName = "";
  for (const message of allMessages) {
    if (message.classList.contains("service")) {
      const timeString = (message as HTMLElement).innerText;
      if (!isDateString(timeString)) {
        continue;
      }
      dayNumber = dateStringToDayNumber(timeString);
      monthNumber = dateStringToMonthNumber(timeString);
      yearNumber = dateStringToYearNumber(timeString);

      dayIndividualRecord[dayNumber] = dayIndividualRecord[dayNumber] || {};
      monthIndividualRecord[monthNumber] =
        monthIndividualRecord[monthNumber] || {};
      yearIndividualRecord[yearNumber] = yearIndividualRecord[yearNumber] || {};
    } else {
      dayRecord[dayNumber] = (dayRecord[dayNumber] || 0) + 1;
      monthRecord[monthNumber] = (monthRecord[monthNumber] || 0) + 1;
      yearRecord[yearNumber] = (yearRecord[yearNumber] || 0) + 1;

      const classList = Array.from(message.classList);
      if (!classList.includes("joined")) {
        const name = message.querySelector(".from_name")?.textContent?.trim();
        if (name) {
          currName = name;
        }
      }
      dayIndividualRecord[dayNumber][currName] =
        (dayIndividualRecord[dayNumber][currName] || 0) + 1;
      monthIndividualRecord[monthNumber][currName] =
        (monthIndividualRecord[monthNumber][currName] || 0) + 1;
      yearIndividualRecord[yearNumber][currName] =
        (yearIndividualRecord[yearNumber][currName] || 0) + 1;
    }
  }

  return {
    days: {
      total: dateDictToArray(dayRecord),
      individual: dateDictToFrequenciesArray(dayIndividualRecord),
    },
    months: {
      total: monthDictToArray(monthRecord),
      individual: monthDictToFrequenciesArray(monthIndividualRecord),
    },
    years: {
      total: yearDictToArray(yearRecord),
      individual: yearDictToFrequenciesArray(yearIndividualRecord),
    },
  };
};

export default analyse;
