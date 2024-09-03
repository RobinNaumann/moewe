import { chartTimeViz } from "../../pages/project/analysis/viz/vv_chart_time";
import { dimensionsViz } from "../../pages/project/analysis/viz/vv_dimensions";
import { eventListViz } from "../../pages/project/analysis/viz/vv_event_list";
import { exportViz } from "../../pages/project/analysis/viz/vv_export";
import { overviewGraphViz } from "../../pages/project/analysis/viz/vv_graph";
import {
  keysViz,
  platformsViz,
} from "../../pages/project/analysis/viz/vv_keys";
import { keystatsViz } from "../../pages/project/analysis/viz/vv_keystats";
import { loglistViz } from "../../pages/project/analysis/viz/vv_log_list";
import { mapViz } from "../../pages/project/analysis/viz/vv_map";
import { sessionsViz } from "../../pages/project/analysis/viz/vv_sessions";
import { Visualization } from "./v_viz";

export const vizs: Visualization<any>[] = [
  chartTimeViz,
  mapViz,
  keystatsViz,
  eventListViz,
  loglistViz,
  keysViz,
  platformsViz,
  sessionsViz,
  overviewGraphViz,
  dimensionsViz,
  exportViz,
];
