import { chartTimeViz } from "../../pages/project/viz/vv_chart_time";
import { eventListViz } from "../../pages/project/viz/vv_event_list";
import { keystatsViz } from "../../pages/project/viz/vv_keystats";
import { loglistViz } from "../../pages/project/viz/vv_log_list";
import { mapViz } from "../../pages/project/viz/vv_map";
import { Visualization } from "./v_viz";


export const vizs: Visualization<any>[] = [
    chartTimeViz,
    mapViz,
    keystatsViz,
    eventListViz,
    loglistViz
];
