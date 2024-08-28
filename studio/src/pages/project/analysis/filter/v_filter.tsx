import { useSignal } from "@preact/signals";
import { PlusIcon, Settings2, XIcon } from "lucide-react";
import { useEffect } from "preact/hooks";
import { EventsBit } from "../../../../bit/b_events";
import { ViewBit } from "../../../../bit/b_view";
import { ElbeDialog } from "../../../../elbe/components";
import {
  ApiFilterItem,
  ApiFilterJoin,
  ApiFilters,
  FilterField,
  filterFields,
} from "../../../../shared";

function _fLabel(f: FilterField | ApiFilterItem | ApiFilterJoin) {
  return (f as any)?.field?.split(".").pop().replace(/_/g, " ") ?? "unknown";
}

export function FilterView({ live = true }: { live?: boolean }) {
  return (
    <div class="card secondary row">
      <_FilterView />

      {live && <_LiveView />}
    </div>
  );
}

0.0;

function _LiveView() {
  const liveSig = useSignal<boolean | null>(false);
  const evSig = EventsBit.use();

  useEffect(() => {
    const id = setInterval(() => {
      const d = evSig.signal.peek().data;
      if (!d) return;
      if (!d.live) return (liveSig.value = null);
      liveSig.value = d.requestedAt > Date.now() - 40 * 1000;
    }, 1000);
    return () => clearInterval(id);
  }, [evSig]);

  return evSig.onData((d) => (
    <button
      class={d.live && liveSig.value ? "action" : "integrated"}
      onClick={() => {
        evSig.ctrl.toggleLive();
      }}
    >
      {!d.live ? "paused" : liveSig.value ? "live" : "outdated"}
      {d.live && liveSig.value && <div class="live-dot" />}
    </button>
  ));
}

function _FilterView({}) {
  const viewBit = ViewBit.use();
  const openSig = useSignal(false);
  return viewBit.onData((d) => (
    <div class="row flex-1">
      <button class="action" onClick={() => (openSig.value = true)}>
        <Settings2 />
        Filter
      </button>
      <div key={d.filter}>
        <_FilterDialog
          open={openSig.value}
          onClose={() => (openSig.value = false)}
          filters={[...d.filter]}
        />
      </div>
      <_Breadcrumbs filter={d.filter} />
    </div>
  ));
}

function _Breadcrumbs({ filter }: { filter: ApiFilters }) {
  return (
    <div
      class="if-wide flex-1 row gap-half"
      style="overflow-y: hidden; overflow-x: scroll; "
    >
      {[...new Set(filter.map((f) => _fLabel(f)))].map((f) => (
        <div
          style="padding: 0.2rem 0.5rem; flex-grow: 0"
          class="rounded loud minor"
        >
          {f}
        </div>
      ))}
    </div>
  );
}

function _FilterDialog({
  open,
  onClose,
  filters,
}: {
  open: boolean;
  onClose: () => void;
  filters: ApiFilters;
}) {
  const viewBit = ViewBit.use();
  const filterSig = useSignal(filters);
  return (
    <ElbeDialog title="Filter" open={open} onClose={onClose}>
      <div class="column cross-stretch-fill" style="width: min(90vw, 30rem)">
        {filterSig.value.length == 0 && (
          <div class="padded centered">no filters set</div>
        )}
        {filterSig.value.map((f, i) =>
          (f as any).method != null ? (
            <div>UNSUPPORTED OR</div>
          ) : (
            <_FilterEntry
              filter={{ ...(f as any) }}
              onChange={(v) => {
                const newFilters = [...filterSig.value];
                v ? (newFilters[i] = v) : newFilters.splice(i, 1);
                filterSig.value = newFilters;
              }}
            />
          )
        )}
        <_FilterAdd
          filter={filterSig.value}
          onCreate={(v) => (filterSig.value = [...filterSig.value, v])}
        />
        <button
          class="action"
          onClick={() => {
            onClose();
            viewBit.ctrl.setFilter(filterSig.value);
          }}
        >
          save
        </button>
      </div>
    </ElbeDialog>
  );
}

function _FilterAdd({
  filter,
  onCreate,
}: {
  filter: ApiFilters;
  onCreate: (v: ApiFilterItem) => void;
}) {
  return (
    <div class="row gap-half" style="overflow-x: auto; padding-bottom: 1rem">
      {filterFields.slice(0, 5).map((f) => (
        <div
          class="pointer loud minor rounded row gap-quarter"
          style="flex-shrink: 0; padding: 0.4rem 0.5rem;"
          onClick={() => {
            onCreate({
              local: false,
              field: f.field,
              operator: "=",
              value: null,
            });
          }}
        >
          <PlusIcon />
          {_fLabel(f)}
        </div>
      ))}
    </div>
  );
}

function _FilterEntry({
  filter,
  onChange,
}: {
  filter: ApiFilterItem;
  onChange: (v: ApiFilterItem) => void;
}) {
  const field = filterFields.find((f) => f.field === filter.field) ?? {
    field: filter.field,
    type: "string",
  };
  return (
    <div
      class="row gap-half main-space-between secondary rounded"
      style={{
        padding: "0.5rem",
        paddingLeft: "1rem",
        opacity: filter.value == null ? "0.5" : "1",
      }}
    >
      <span class="b flex-1">{_fLabel(filter)}</span>
      <select
        onInput={(e) => {
          onChange({ ...filter, operator: e.currentTarget.value as any });
        }}
      >
        {(field.type == "string"
          ? ["=", "!="]
          : ["=", "!=", ">", "<", ">=", "<="]
        ).map((o) => (
          <option selected={o === filter.operator}>{o}</option>
        ))}
      </select>
      <input
        type={field.type?.replace("string", "text")}
        style="width: 11rem"
        value={
          !!filter.value
            ? field.type == "date"
              ? new Date(filter.value).toISOString().slice(0, 10)
              : filter.value
            : ""
        }
        onInput={(e) => {
          const v = e.currentTarget.value;
          onChange({
            ...filter,
            value: field.type === "date" ? new Date(v).getTime() : v,
          });
        }}
      />

      <button
        class="integrated"
        style="width: 3rem"
        onClick={() => onChange(null)}
      >
        <XIcon />
      </button>
    </div>
  );
}
