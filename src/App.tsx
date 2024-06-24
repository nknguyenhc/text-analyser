import { Button, Grid, Typography } from "@mui/material";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import "./App.scss";
import analyse from "./analyser";
import { Bar, BarChart, Rectangle, Tooltip, XAxis, YAxis } from "recharts";

type TextCounts = {
  [key: string]: number;
};

const App = () => {
  const [files, setFiles] = useState<File[] | undefined>();
  const [errors, setErrors] = useState<string[]>([]);
  const [textCounts, setTextCounts] = useState<TextCounts>({});

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

  const readFile = useCallback(
    async (file: File, textCounts: TextCounts, errors: string[]) => {
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
          resolve();
        };
        reader.readAsText(file);
      });
    },
    []
  );

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (!selectedFiles) {
        return;
      }
      const files = Array.from(selectedFiles);
      const errors: string[] = [];
      const textCounts: TextCounts = {};
      for (const file of files) {
        await readFile(file, textCounts, errors);
      }
      setFiles(files);
      setErrors(errors);
      setTextCounts(textCounts);
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
      <BarChart width={300} height={300} data={textCountData}>
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

export default App;
