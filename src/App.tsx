import { Button, Grid, Typography } from "@mui/material";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import "./App.scss";
import analyse, { FrequencyRecord } from "./analyser";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Rectangle,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TextCounts = {
  [key: string]: number;
};

const App = () => {
  const [files, setFiles] = useState<File[] | undefined>();
  const [errors, setErrors] = useState<string[]>([]);
  const [isResultAvailable, setIsResultAvailable] = useState<boolean>(false);
  const [textCounts, setTextCounts] = useState<TextCounts>({});
  const [textGroupCounts, setTextGroupCounts] = useState<TextCounts>({});
  const [dayFrequency, setDayFrequency] = useState<FrequencyRecord[]>([]);
  const [monthFrequency, setMonthFrequency] = useState<FrequencyRecord[]>([]);
  const [yearFrequency, setYearFrequency] = useState<FrequencyRecord[]>([]);

  const filesName = useMemo<string>(() => {
    if (!files) {
      return "No files selected";
    }
    const name = Array.from(files)
      .map((file) => file.name)
      .join(", ");
    if (name.length > 100) {
      return name.slice(0, 90) + "...";
    } else {
      return name;
    }
  }, [files]);

  const textCountData = useMemo(() => {
    return Object.entries(textCounts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [textCounts]);

  const textGroupCountsData = useMemo(() => {
    return Object.entries(textGroupCounts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [textGroupCounts]);

  const selectiveAddition = useCallback(
    (data: FrequencyRecord[], newData: FrequencyRecord[]) => {
      if (data.length === 0) {
        data.push(...newData);
        return;
      }
      if (data[data.length - 1].name === newData[0].name) {
        data[data.length - 1].count += newData[0].count;
        data.push(...newData.slice(1));
      } else {
        data.push(...newData);
      }
    },
    []
  );

  const readFile = useCallback(
    async (
      file: File,
      textCounts: TextCounts,
      textGroupCounts: TextCounts,
      frequencies: FrequencyRecord[][],
      errors: string[]
    ) => {
      const [dayFrequency, monthFrequency, yearFrequency] = frequencies;
      const reader = new FileReader();
      return new Promise<void>((resolve) => {
        reader.onload = (e) => {
          const fileContent = e.target?.result;
          if (typeof fileContent !== "string") {
            errors.push("Failed to read file content");
            resolve();
            return;
          }
          const analysisResult = analyse(file.name, fileContent);
          if (!analysisResult.success) {
            errors.push(analysisResult.error!);
            resolve();
            return;
          }
          const result = analysisResult.result!;
          for (const [name, count] of Object.entries(result.textCounts)) {
            textCounts[name] = (textCounts[name] || 0) + count;
          }
          for (const [name, count] of Object.entries(result.textGroupCounts)) {
            textGroupCounts[name] = (textGroupCounts[name] || 0) + count;
          }
          selectiveAddition(dayFrequency, result.textFrequencies.days);
          selectiveAddition(monthFrequency, result.textFrequencies.months);
          selectiveAddition(yearFrequency, result.textFrequencies.years);
          resolve();
        };
        reader.readAsText(file);
      });
    },
    [selectiveAddition]
  );

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (!selectedFiles) {
        setIsResultAvailable(false);
        return;
      }
      const files = Array.from(selectedFiles);
      const errors: string[] = [];
      const textCounts: TextCounts = {};
      const textGroupCounts: TextCounts = {};
      const dayFrequency: FrequencyRecord[] = [];
      const monthFrequency: FrequencyRecord[] = [];
      const yearFrequency: FrequencyRecord[] = [];
      const frequencies = [dayFrequency, monthFrequency, yearFrequency];
      for (const file of files) {
        await readFile(file, textCounts, textGroupCounts, frequencies, errors);
      }
      setIsResultAvailable(true);
      setFiles(files);
      setErrors(errors);
      setTextCounts(textCounts);
      setTextGroupCounts(textGroupCounts);
      setDayFrequency(dayFrequency);
      setMonthFrequency(monthFrequency);
      setYearFrequency(yearFrequency);
    },
    [readFile]
  );

  return (
    <div className="main">
      <Typography variant="h4" align="center" sx={{ padding: "50px" }}>
        Analyse your Telegram texts!
      </Typography>
      <Grid container alignItems="center" justifyContent="center" spacing={2}>
        <label htmlFor="file-upload">
          <Button component="span">Upload File</Button>
        </label>
        <Typography sx={{ width: "300px", textAlign: "center" }}>
          {filesName}
        </Typography>
        <input
          id="file-upload"
          type="file"
          accept=".html"
          multiple={true}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </Grid>
      <Grid container alignItems="center" justifyContent="center" spacing={2}>
        {errors.map((error, index) => (
          <Typography key={index} color="error">
            {error}
          </Typography>
        ))}
      </Grid>
      {isResultAvailable && (
        <div className="charts">
          <Chart
            title="Total text counts"
            explanation="This is the total text counts for each person in the chat. Each text bubble is counted as one text."
            data={textCountData}
          />
          <Chart
            title="Total text group counts"
            explanation="This is the total counts of groups of text for each person. Multiple consecutive texts at once are counted as one group."
            data={textGroupCountsData}
          />
          <Graph
            title="Day frequency"
            explanation="This is the frequency of texts sent over the last few days."
            data={dayFrequency}
          />
          <Graph
            title="Month frequency"
            explanation="This is the frequency of texts sent over the last few months."
            data={monthFrequency}
          />
          <Graph
            title="Year frequency"
            explanation="This is the frequency of texts sent over the last few years."
            data={yearFrequency}
          />
        </div>
      )}
    </div>
  );
};

const Chart = ({
  title,
  explanation,
  data,
}: {
  title: string;
  explanation: string;
  data: FrequencyRecord[];
}): JSX.Element => {
  return (
    <div className="chart chart-md">
      <div className="chart-text">
        <Typography variant="h4" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography paragraph>{explanation}</Typography>
      </div>
      <BarChart width={300} height={300} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar
          dataKey="count"
          fill="purple"
          activeBar={<Rectangle fill="pink" stroke="blue" />}
        />
      </BarChart>
    </div>
  );
};

const Graph = ({
  title,
  explanation,
  data,
}: {
  title: string;
  explanation: string;
  data: { name: string; count: number }[];
}): JSX.Element => {
  const displayData = useMemo(() => {
    return data.slice(-11);
  }, [data]);

  return (
    <div className="chart chart-lg">
      <div className="chart-text">
        <Typography variant="h4" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography paragraph>{explanation}</Typography>
      </div>
      <LineChart width={500} height={300} data={displayData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="blue" />
      </LineChart>
    </div>
  );
};

export default App;
