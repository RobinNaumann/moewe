import { Move3D } from "lucide-react";
import { ApiEvent } from "../../../../shared";
import { humanId } from "../../../../util/u_hash_to_human";
import { Visualization, VizContext } from "../../../../util/viz/v_viz";

interface _EventGroup {
  key: string;
  events: ApiEvent[];
}

const defaultOptions = {
  show_key: true,
  show_platform: true,
  show_device: true,
  show_app_version: true,
  show_country: true,
  show_city: true,
  show_session: true,
};

function _setFilter(c: VizContext<ApiEvent, any>, key: string) {
  return (value: string) => {
    c.setFilter([
      ...c.filter,
      {
        local: false,
        field: key,
        operator: "=",
        value: value,
      },
    ]);
  };
}

export const dimensionsViz: Visualization<typeof defaultOptions> = {
  id: "dimensions",
  types: "all",
  label: "Dimensions",
  icon: <Move3D />,
  options: Object.keys(defaultOptions).map((key) => ({
    key,
    label: key.replace(/_/g, " "),
    type: "boolean",
  })),
  defaults: defaultOptions,
  builder: (c) => {
    return (
      <div class="column cross-stretch">
        {c.options.show_key && (
          <_GroupedSection
            label="Key"
            toKey={(e) => e.key}
            events={c.events}
            onSelect={_setFilter(c, "key")}
          />
        )}
        {c.options.show_platform && (
          <_GroupedSection
            label="Platform"
            toKey={(e) => e.meta.device.platform}
            events={c.events}
            onSelect={_setFilter(c, "meta.platform")}
          />
        )}
        {c.options.show_device && (
          <_GroupedSection
            label="Device"
            toKey={(e) => e.meta.device.device}
            events={c.events}
            onSelect={_setFilter(c, "meta.device")}
          />
        )}
        {c.options.show_app_version && (
          <_GroupedSection
            label="App Version"
            toKey={(e) => e.meta.device.version}
            events={c.events}
            onSelect={_setFilter(c, "meta.version")}
          />
        )}
        {c.options.show_country && (
          <_GroupedSection
            label="Country"
            toKey={(e) => e.meta.location.country}
            events={c.events}
            onSelect={_setFilter(c, "meta.location.country")}
          />
        )}
        {c.options.show_city && (
          <_GroupedSection
            label="City"
            toKey={(e) => e.meta.location.city}
            events={c.events}
            onSelect={_setFilter(c, "meta.location.city")}
          />
        )}
        {c.options.show_session && (
          <_GroupedSection
            label="Session"
            toKey={(e) => e.meta.session}
            events={c.events}
            humanize={(k) => humanId(k)}
            onSelect={_setFilter(c, "meta.session")}
          />
        )}
      </div>
    );
  },
};

function _GroupedSection({
  label,
  toKey,
  events,
  humanize,
  onSelect,
}: {
  label: string;
  toKey: (e: ApiEvent) => string;
  events: ApiEvent[];
  humanize?: (key: string) => string;
  onSelect: (key: string) => void;
}) {
  let groups: _EventGroup[] = events.reduce((gs, e) => {
    let key = "";
    try {
      key = toKey(e);
      if (!key || key.length === 0) {
        key = "";
      }
    } catch (e) {
      return gs;
    }
    const group = gs.find((g) => g.key === key);
    if (group) {
      group.events.push(e);
    } else {
      gs.push({ key, events: [e] });
    }
    return gs;
  }, []);

  if (humanize) {
    groups = groups.map((g) => ({ key: humanize(g.key), events: g.events }));
  }

  // put empty groups at the end
  groups = groups.sort((a, b) => {
    if (a.key.length === 0 && b.key.length > 0) {
      return 1;
    }
    if (a.key.length > 0 && b.key.length === 0) {
      return -1;
    }
    return a.key > b.key ? 1 : -1;
  });

  return (
    <div class="column cross-stretch">
      <div class="row gap-half">
        <div class="section-label b">{label}</div>
        <div>({groups.length})</div>
      </div>

      <div class="row-scroll">
        {groups.map((g) => (
          <_DimensionChip group={g} onClick={() => onSelect(g.key)} />
        ))}
      </div>
    </div>
  );
}

function _DimensionChip({
  group,
  onClick,
}: {
  group: _EventGroup;
  onClick: () => any;
}) {
  const hasKey = group.key?.length > 0;
  return (
    <button
      onClick={hasKey ? () => onClick() : undefined}
      class={`row gap-half loud minor ${hasKey ? "" : "disabled"}`}
      style="padding-left: 1rem; padding-right: 1rem"
    >
      {hasKey ? <div>{group.key} </div> : <i class="nb i">none</i>}
      <div class="nb">|</div>
      <div class="nb">{group.events.length}</div>
    </button>
  );
}
