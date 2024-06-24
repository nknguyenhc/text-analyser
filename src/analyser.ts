type AnalyserResult = {
  success: boolean;
  error?: string;
  result?: {
    textCounts: {
      name: string;
      count: number;
    }[];
  };
};

type Record = {
  [key: string]: number;
};

const analyse = (text: string): AnalyserResult => {
  const doc = document.createElement("div");
  doc.innerHTML = text;
  const allMessages = Array.from(doc.querySelectorAll(".message.default"));
  if (allMessages.length === 0) {
    return {
      success: false,
      error: "No messages found in the file",
    };
  }

  const textCounts: Record = {};
  for (const message of allMessages) {
    const name = message.querySelector(".from_name")?.textContent?.trim();
    if (name) {
      textCounts[name] = (textCounts[name] || 0) + 1;
    }
  }

  const result = {
    textCounts: Object.entries(textCounts).map(([name, count]) => ({
      name,
      count,
    })),
  };

  return {
    success: true,
    result,
  };
};

export default analyse;
