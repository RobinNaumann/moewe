import { useSignal } from "@preact/signals";
import { ChevronDown, ChevronUp, Clock, Eye, ListIcon } from "lucide-react";
import { ElbeDialog } from "../../../../elbe/components";
import { ApiEvent } from "../../../../shared";
import { Visualization, VizContext } from "../../../../util/viz/v_viz";
import { DeviceChip, LocationChip, SessionChip } from "../v_event_chips";

export function Grow({ children }: { children: any }) {
  return <div class="flex-1 row">{children}</div>;
}

const columns = [
  {
    key: "col_key",
    name: "key",
    label: "show key",
    sortFn: (a, b) => (a.key > b.key ? 1 : -1),
  },
  {
    key: "col_time",
    name: "time",
    label: "show time",
    sortFn: (a, b) => (a.meta.created_at > b.meta.created_at ? 1 : -1),
  },
  {
    key: "col_device",
    name: "device",
    label: "show device",
    sortFn: (a, b) =>
      a.meta.device.platform > b.meta.device.platform ? 1 : -1,
  },
  {
    key: "col_location",
    name: "location",
    label: "show location",
    sortFn: (a, b) =>
      a.meta.location.country > b.meta.location.country ? 1 : -1,
  },
  {
    key: "col_session",
    name: "session",
    label: "show session",
    sortFn: (a, b) => (a.meta.session > b.meta.session ? 1 : -1),
  },
];

const defaultOptions = columns.reduce((acc, col) => {
  acc[col.key] = true;
  return acc;
});

export const eventListViz: Visualization<typeof defaultOptions> = {
  id: "eventlist",
  types: "all",
  label: "Event List",
  icon: <ListIcon />,
  options: columns.map((col) => ({
    key: col.key,
    label: col.label,
    type: "boolean",
  })),
  defaults: defaultOptions,
  builder: (c) => <EventListViz c={c} />,
};

function EventListViz({
  c,
}: {
  c: VizContext<ApiEvent, typeof defaultOptions>;
}) {
  const sortSig = useSignal({ key: "time", order: "desc" });

  return (
    <div
      class="column cross-stretch-fill gap-quarter"
      style={{
        minWidth:
          10 + 15 * columns.filter((e) => c.options[e.key]).length + "rem",
      }}
    >
      <_HeaderView options={c.options} sortSig={sortSig} />
      {c.events
        .sort((a, b) => {
          const col = columns.find((c) => c.key === sortSig.value.key);
          if (!col) return 0;
          return sortSig.value.order === "asc"
            ? col.sortFn(a, b)
            : col.sortFn(b, a);
        })

        .map((ev) => (
          <_EventRow
            ev={ev}
            options={c.options}
            onKeyClick={(k) =>
              c.setFilter(
                [{ field: "key", local: false, operator: "=", value: k }],
                true
              )
            }
          />
        ))}
    </div>
  );
}

function _HeaderView({
  options,
  sortSig,
}: {
  options: typeof defaultOptions;
  sortSig: any;
}) {
  return (
    <div class="row main-space-between t-row">
      {columns.map(
        (col) =>
          options[col.key] && (
            <div class="flex-1 row main-start">
              <button
                class="b integrated"
                onClick={() => {
                  if (sortSig.value.key === col.key) {
                    sortSig.value.order =
                      sortSig.value.order === "asc" ? "desc" : "asc";
                  } else {
                    sortSig.value.key = col.key;
                    sortSig.value.order = "asc";
                  }
                  sortSig.value = { ...sortSig.value };
                }}
              >
                {col.name}
                {sortSig.value.key === col.key &&
                  (sortSig.value.order === "asc" ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  ))}
              </button>
            </div>
          )
      )}
      <div class="flex-1"></div>
    </div>
  );
}

function _EventRow({
  options,
  ev,
  onKeyClick,
}: {
  options: any; //typeof defaultOptions;
  ev: ApiEvent;
  onKeyClick: (key: string) => void;
}) {
  return (
    <div class="row main-space-between t-row highlightable">
      {options.col_key && (
        <div class={"flex-1 row"}>
          <div class="chip" onClick={() => onKeyClick(ev.key)}>
            {ev.key}
          </div>
        </div>
      )}

      {options.col_time &&
        (ev.meta.created_at ? (
          <div class="flex-1 row gap-half">
            <Clock />
            <div class="column cross-stretch gap-none">
              <div class="">
                {new Date(ev.meta.created_at).toLocaleTimeString()}
              </div>
              <div class="b text-s">
                {new Date(ev.meta.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ) : (
          <div class="i flex-1" style="opacity: 0.4">
            —
          </div>
        ))}

      {options.col_device &&
        (ev.meta.device.platform ? (
          <Grow>
            <DeviceChip event={ev} />
          </Grow>
        ) : (
          <div class="i flex-1" style="opacity: 0.4">
            —
          </div>
        ))}

      {options.col_location &&
        (ev.meta.location.country ? (
          <Grow>
            <LocationChip event={ev} />
          </Grow>
        ) : (
          <div class="i flex-1" style="opacity: 0.4">
            —
          </div>
        ))}
      {options.col_session &&
        (ev.meta.session ? (
          <Grow>
            <SessionChip event={ev} />
          </Grow>
        ) : (
          <div class="i flex-1" style="opacity: 0.4">
            —
          </div>
        ))}

      <div class="flex-1 row main-end">
        <DataDialogButton event={ev} />
      </div>
    </div>
  );
}

export function DataDialogButton({ event }: { event: ApiEvent }) {
  const openSig = useSignal(false);
  return (
    <button class="action" onClick={() => (openSig.value = true)}>
      <Eye /> data
      <ElbeDialog
        title="data"
        open={openSig.value}
        onClose={() => (openSig.value = false)}
      >
        <pre
          class="inverse card"
          style="font-family: 'Space Mono'; overflow: scroll; margin: 0"
        >
          {JSON.stringify(event.data, null, 2)}
        </pre>
      </ElbeDialog>
    </button>
  );
}
