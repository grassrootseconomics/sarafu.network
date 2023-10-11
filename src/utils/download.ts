export const exportToJson = (data: object) => {
  downloadFile({
    data: JSON.stringify(data),
    fileName: "transactions.json",
    fileType: "text/json",
  });
};
export const exportToCSV = (data?: { [header: string]: string | number }[]) => {
  if (!data || data.length === 0) return;
  const csvRows = [];
  // get the headers
  const headers = data[0] ? Object.keys(data[0]) : [];

  csvRows.push(headers.join(","));
  // loop over the rows
  for (const row of data) {
    const values = headers.map((header: string) => {
      const escaped = ("" + row[header]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }
  // create a blob and save it
  downloadFile({
    data: csvRows.join("\n"),
    fileName: "stats.csv",
    fileType: "text/csv",
  });
};
export const downloadFile = ({
  data,
  fileName,
  fileType,
}: {
  data: string;
  fileName: string;
  fileType: string;
}) => {
  // Create a blob with the data we want to download as a file
  const blob = new Blob([data], { type: fileType });
  // Create an anchor element and dispatch a click event on it
  // to trigger a download
  const a = document.createElement("a");
  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  const clickEvt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  a.dispatchEvent(clickEvt);
  a.remove();
};
