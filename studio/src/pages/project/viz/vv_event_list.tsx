import {
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Globe2,
  ListIcon,
  TabletSmartphone,
  User,
} from "lucide-react";
import { ApiEvent } from "../../../bit/b_events";
import { useSignal } from "@preact/signals";
import { ElbeDialog } from "../../../elbe/components";
import { humanId } from "../../../util/u_hash_to_human";
import { Visualization } from "../../../util/viz/v_viz";

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
  builder: (data, o) => <EventListViz options={o} events={data.entries} />,
};

function EventListViz({
  options,
  events,
}: {
  options: typeof defaultOptions;
  events: ApiEvent[];
}) {
  const sortSig = useSignal({ key: "time", order: "desc" });

  return (
    <div
      class="column cross-stretch-fill gap-quarter"
      style={{
        minWidth:
          10 + 10 * columns.filter((c) => options[c.key]).length + "rem",
      }}
    >
      <_HeaderView options={options} sortSig={sortSig} />
      {events
        .sort((a, b) => {
          const col = columns.find((c) => options[c.key]);
          if (!col) return 0;
          return sortSig.value.order === "asc"
            ? col.sortFn(a, b)
            : col.sortFn(b, a);
        })

        .map((ev) => (
          <_EventRow ev={ev} options={options} />
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
}: {
  options: any; //typeof defaultOptions;
  ev: ApiEvent;
}) {
  return (
    <div class="row main-space-between t-row highlightable">
      {options.col_key && (
        <div class={"flex-1 row"}>
          <div class="chip">{ev.key}</div>
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
          <div class="flex-1 row gap-half">
            <TabletSmartphone />
            <div class="column cross-stretch gap-none">
              <div class="">{ev.meta.device.platform}</div>
              <div class="b text-s">{ev.meta.device.device ?? ""}</div>
            </div>
          </div>
        ) : (
          <div class="i flex-1" style="opacity: 0.4">
            —
          </div>
        ))}

      {options.col_location &&
        (ev.meta.location.country ? (
          <div class="flex-1 row gap-half">
            <Globe2 />
            <div class="column cross-stretch gap-none">
              <div class="">{ev.meta.location.country}</div>
              <div class="b text-s">{ev.meta.location.city ?? ""}</div>
            </div>
          </div>
        ) : (
          <div class="i flex-1" style="opacity: 0.4">
            —
          </div>
        ))}
      {options.col_session &&
        (ev.meta.session ? (
          <div class="flex-1 row gap-half">
            <User />
            <div
              class="secondary rounded text-s"
              style={{
                padding: "0.2rem 0.3rem",
                marginTop: "0.4rem",
              }}
            >
              {humanId(ev.meta.session)}
            </div>
          </div>
        ) : (
          <div class="i flex-1" style="opacity: 0.4">
            —
          </div>
        ))}

      <div class="flex-1 row main-end">
        <DataDialogButton {...ev} />
      </div>
    </div>
  );
}

function DataDialogButton(ev: ApiEvent) {
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
          {JSON.stringify(ev.data, null, 2)}
        </pre>
      </ElbeDialog>
    </button>
  );
}
