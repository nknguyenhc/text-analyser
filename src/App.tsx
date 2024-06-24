import { Button, Grid, Typography } from "@mui/material";
import { ChangeEvent, useCallback, useState } from "react";
import "./App.scss";

const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
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
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </Grid>
    </div>
  );
};

export default App;
