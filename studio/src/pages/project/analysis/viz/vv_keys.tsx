import { KeyIcon, TabletSmartphoneIcon } from "lucide-react";
import { ApiEvent, ApiFilters } from "../../../../shared";
import { EventGroup, groupBy } from "../../../../util/event_util";
import { Visualization, VizContext } from "../../../../util/viz/v_viz";

const defaultOptions = {};

export const keysViz: Visualization<typeof defaultOptions> = {
  id: "key_chart",
  types: "all",
  label: "Keys",
  icon: <KeyIcon />,
  options: [],
  defaults: defaultOptions,
  builder: (c) => (
    <_GraphViz
      options={c.options}
      events={c.events}
      label={_keyLabel(c)}
      groupFn={_keyGroup}
    />
  ),
};

export const platformsViz: Visualization<typeof defaultOptions> = {
  id: "platform_chart",
  types: "all",
  label: "Platforms",
  icon: <TabletSmartphoneIcon />,
  options: [],
  defaults: defaultOptions,
  builder: (c) => (
    <_GraphViz
      options={c.options}
      events={c.events}
      label={_platformLabel(c)}
      groupFn={_platformGroup}
    />
  ),
};

function _GraphViz({
  options,
  events,
  label,
  groupFn,
}: {
  options: typeof defaultOptions;
  events: ApiEvent[];
  label: (key: string) => any;
  groupFn: (e: ApiEvent[]) => EventGroup[];
}) {
  const groups = groupFn(events).sort(
    (a, b) => b.items.length - a.items.length
  );
  const max = groups.reduce((a, b) => Math.max(a, b.items.length), 0);
  return (
    <div class="column cross-stretch">
      {groups.map((e) => (
        <_GraphRow group={e} max={max}>
          {label(e.key)}
        </_GraphRow>
      ))}
    </div>
  );
}

function _keyGroup(e: ApiEvent[]) {
  return groupBy(e, (e) => e.key);
}

function _platformGroup(e: ApiEvent[]) {
  return groupBy(e, (e) => e.meta.device.platform || "");
}

function _keyLabel(c: VizContext<ApiEvent, typeof defaultOptions>) {
  const filter = (v: string): ApiFilters => [
    { field: "key", local: false, operator: "=", value: v },
  ];
  return (key: string) => (
    <div
      class="chip"
      style="margin: 0"
      onClick={() => c.setFilter(filter(key), true)}
    >
      {key}
    </div>
  );
}

function _platformLabel(c: VizContext<ApiEvent, typeof defaultOptions>) {
  const filter = (v: string): ApiFilters => [
    { field: "meta.device.platform", local: false, operator: "=", value: v },
  ];
  return (key: string) => (
    <div class="b" onClick={() => c.setFilter(filter(key), true)}>
      {key}
    </div>
  );
}

function _GraphRow({
  group,
  max,
  children,
}: {
  group: EventGroup;
  max: number;
  children: any;
}) {
  return (
    <div class="row highlightable">
      <b style="width: 10rem">{children}</b>
      <div class="row flex-1" style="min-height: 3rem">
        <div
          class="accent rounded row"
          style={{
            height: "2rem",
            padding: ".25rem 0.5rem",
            width: `max(2rem,${(group.items.length / max) * 100}%)`,
          }}
        >
          {group.items.length}
        </div>
      </div>
    </div>
  );
}
