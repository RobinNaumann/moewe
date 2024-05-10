import {
  ActivityIcon,
  MessageSquare,
  RouteIcon,
  ScrollIcon,
  ServerCrash,
  Settings,
  TabletSmartphone,
  Users2,
} from "lucide-react";
import { EventsBit } from "../../bit/b_events";
import { ProjectBit } from "../../bit/b_project";
import { FilterView } from "./filter/v_filter";
import { VisView } from "../../util/viz/v_viz";
import { ViewBit } from "../../bit/b_view";
import { P } from "pino";
import { ProjectSettingsView } from "./v_settings";
import { ProjectAppsView } from "./v_apps";
import { UserFeedbackView } from "./v_user_feedback";

export interface ProjectView {
  type: string | null;
  label: string;
  icon: () => any;
  bottom?: boolean;
  builder: (type: string | null) => any | null;
}

export const projectViews: {[key:string]: ProjectView} = {
  appsView: {
    type: null,
    label: "apps",
    icon: () => <TabletSmartphone />,
    builder: (t) => <ProjectAppsView/>,
  },
  eventView: {
    type: "event",
    label: "events",
    icon: () => <ActivityIcon />,
    builder: (t) => <ProjectViewBuilder type={t} />,
  },
  routesView: {
    type: null,
    label: "routes",
    icon: () => <RouteIcon />,
    builder: null
  },
  logView: {
    type: "log",
    label: "logs",
    icon: () => <ScrollIcon />,
    builder: (t) => <ProjectViewBuilder type={t} />,
  },

  crashView: {
    type: "crash",
    label: "crashes",
    icon: () => <ServerCrash />,
    builder: (t) => <ProjectViewBuilder type={t} />,
  },
  feedbackView: {
    type: null,
    label: "feedback",
    icon: () => <MessageSquare />,
    builder: (t) => <UserFeedbackView  />,
  },
  settingsView: {
    type: null,
    label: "settings",
    icon: () => <Settings />,
    bottom: true,
    builder: () => <ProjectSettingsView />,
  }
};

function ProjectViewBuilder({ type }: { type: string }) {
  const project = ProjectBit.use();
  const vBit = ViewBit.use();
  return project.map({
    onData: (p) =>
      vBit.map({
        onData: (v) => (
          <EventsBit.Provide project={p.id} type={type} filter={v.filter}>
            <div class="column cross-stretch flex-1 padded">
              <FilterView />
              <VisView view={type} />
            </div>
          </EventsBit.Provide>
        ),
      }),
  });
}
