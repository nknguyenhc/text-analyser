type Record = {
  [key: string]: number;
};

type AnalyserResult = {
  success: boolean;
  error?: string;
  result?: {
    textCounts: Record;
    textGroupCounts: Record;
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

  return {
    success: true,
    result: {
      textCounts,
      textGroupCounts,
    },
  };
};

export default analyse;
