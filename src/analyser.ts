type AnalyserResult = {
  success: boolean;
  error?: string;
  result?: {
    textCounts: {
      [key: string]: number;
    };
  };
};

type Record = {
  [key: string]: number;
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
  for (const message of allMessages) {
    const name = message.querySelector(".from_name")?.textContent?.trim();
    if (name) {
      textCounts[name] = (textCounts[name] || 0) + 1;
    }
  }

  return {
    success: true,
    result: {
      textCounts,
    },
  };
};

export default analyse;
