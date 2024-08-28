import { LayoutGrid } from "lucide-react";
import { ApiEvent } from "../../../../shared";
import { EventGroup, groupBy } from "../../../../util/event_util";
import { Visualization } from "../../../../util/viz/v_viz";

const defaultOptions = {
  event_count: true,
  session_count: true,
  platform_count: true,
  country_count: true,
  keys_count: true,
};

export const keystatsViz: Visualization<typeof defaultOptions> = {
  id: "keystats",
  types: "all",
  label: "Key Stats",
  icon: <LayoutGrid />,
  options: [
    {
      key: "event_count",
      label: "show the number of events",
      type: "boolean",
    },
    {
      key: "session_count",
      label: "show the number of sessions",
      type: "boolean",
    },
    {
      key: "platform_count",
      label: "show the number of platforms",
      type: "boolean",
    },
    {
      key: "country_count",
      label: "show the number of countries",
      type: "boolean",
    },
    {
      key: "keys_count",
      label: "show the number of keys",
      type: "boolean",
    },
  ],
  defaults: defaultOptions,
  builder: (c) => <KeyStatsViz options={c.options} events={c.events} />,
};

function platforms(events: ApiEvent[]): EventGroup[] {
  return groupBy(events, (e) => e.meta.device.platform);
}

function sessions(events: ApiEvent[]): EventGroup[] {
  return groupBy(events, (e) => e.meta.session);
}

function countries(events: ApiEvent[]): EventGroup[] {
  return groupBy(events, (e) => e.meta.location.country);
}

function keys(events: ApiEvent[]): EventGroup[] {
  return groupBy(events, (e) => e.key);
}

function KeyStatsViz({
  options,
  events,
}: {
  options: typeof defaultOptions;
  events: ApiEvent[];
}) {
  return (
    <div class="row wrap main-center">
      {options.event_count && (
        <_LargeStat label="events" value={events.length} />
      )}
      {options.session_count && (
        <_LargeStat label="sessions" value={sessions(events).length} />
      )}
      {options.platform_count && (
        <_LargeStat label="platforms" value={platforms(events).length} />
      )}
      {options.country_count && (
        <_LargeStat label="countries" value={countries(events).length} />
      )}
      {options.keys_count && (
        <_LargeStat label="keys" value={keys(events).length} />
      )}
    </div>
  );
}

function _LargeStat({ label, value }: { label: string; value: number }) {
  return (
    <div
      class="column cross-center padded gap-quarter"
      style="min-width: 10rem"
    >
      <div style="font-size: 3rem" class="b action">
        {value}
      </div>
      <div class="text-small">{label}</div>
    </div>
  );
}
