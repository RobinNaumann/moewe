import {
  ActivityIcon,
  MessageSquare,
  RouteIcon,
  ScrollIcon,
  ServerCrash,
  Settings,
  TabletSmartphone,
} from "lucide-react";
import React from "preact/compat";
import { AppsBit } from "../../../bit/b_apps";
import { EventsBit } from "../../../bit/b_events";
import { ProjectBit } from "../../../bit/b_project";
import { ViewBit } from "../../../bit/b_view";
import { VisView } from "../../../util/viz/v_viz";
import { ProjectAppsView } from "../v_apps";
import { ProjectSettingsView } from "../v_settings";
import { UserFeedbackView } from "../v_user_feedback";
import { FilterView } from "./filter/v_filter";
import { NoAppEntry } from "./v_no_app_entry";

export interface ProjectView {
  type: string | null;
  label: string;
  icon: () => any;
  bottom?: boolean;
  builder: (type: string | null) => any | null;
}

export const projectViews: { [key: string]: ProjectView } = {
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
    builder: null,
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
    builder: (t) => <UserFeedbackView />,
  },
  appsView: {
    type: null,
    label: "apps",
    bottom: true,
    icon: () => <TabletSmartphone />,
    builder: (t) => <ProjectAppsView />,
  },
  settingsView: {
    type: null,
    label: "settings",
    bottom: true,
    icon: () => <Settings />,
    builder: () => <ProjectSettingsView />,
  },
};

function ProjectViewBuilder({ type }: { type: string }) {
  const project = ProjectBit.use();
  const vBit = ViewBit.use();

  return project.map({
    onData: (p) =>
      vBit.map({
        onData: (v) => (
          <_MemProjectView projectId={p.id} filter={v.filter} type={type} />
        ),
      }),
  });
}

const _MemProjectView = React.memo(
  _ProjectView,
  (prev, next) =>
    prev.projectId === next.projectId && prev.filter === next.filter
);

function _ProjectView({
  projectId,
  filter,
  type,
}: {
  projectId: string;
  filter: any;
  type: string;
}) {
  return (
    <AppsBit.Provide projectId={projectId}>
      <EventsBit.Provide project={projectId} type={type} filter={filter}>
        <div class="column cross-stretch flex-1" style="margin: 0 1rem">
          <NoAppEntry />
          <FilterView />
          <VisView view={type} />
        </div>
      </EventsBit.Provide>
    </AppsBit.Provide>
  );
}
