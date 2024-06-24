import { Button, Grid, Typography } from "@mui/material";
import { ChangeEvent, useCallback, useState } from "react";
import "./App.scss";
import analyse from "./analyser";

const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Console log the content of the selected file
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result;
        if (typeof fileContent !== "string") {
          setError("File content is not a string");
          return;
        }
        const analysisResult = analyse(fileContent);
        console.log(analysisResult);
      };
      reader.readAsText(selectedFile);
      setFile(selectedFile);
    }
  }, []);

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
          {file ? file.name : "No file selected"}
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
      {error && (
        <Typography variant="body1" color="error" sx={{ padding: "10px" }}>
          {error}
        </Typography>
      )}
    </div>
  );
};

export default App;
