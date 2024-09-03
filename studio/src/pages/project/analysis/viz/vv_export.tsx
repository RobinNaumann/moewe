import { Download } from "lucide-react";
import { Visualization } from "../../../../util/viz/v_viz";

const defaultOptions = {};

function _downloadAsFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function _flattenObject(obj: any, parentKey = "", res = {} as any) {
  for (let key in obj) {
    const propName = parentKey ? `${parentKey}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      _flattenObject(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
}

function _ArrayToCSV(objArray: any[]) {
  if (objArray.length === 0) return "";

  const flattenedArray = objArray.map((obj) => _flattenObject(obj));
  const headers = Object.keys(flattenedArray[0]);
  const csvRows = flattenedArray.map((obj) =>
    headers.map((header) => JSON.stringify(obj[header] ?? "")).join(",")
  );

  return [headers.join(","), ...csvRows].join("\n");
}

export const exportViz: Visualization<typeof defaultOptions> = {
  id: "export",
  types: "all",
  label: "Export Data",
  icon: <Download />,
  options: [],
  defaults: defaultOptions,
  builder: (c) => {
    return (
      <div class="row wrap">
        <button
          class="loud minor"
          onClick={() => {
            _downloadAsFile(
              "moewe_export.json",
              JSON.stringify(c.events, null, 2)
            );
          }}
        >
          as JSON
        </button>
        <button
          class="loud minor"
          onClick={() => {
            _downloadAsFile("moewe_export.json", _ArrayToCSV(c.events));
          }}
        >
          as CSV
        </button>
      </div>
    );
  },
};
