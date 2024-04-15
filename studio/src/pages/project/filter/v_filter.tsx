import { useSignal } from "@preact/signals";
import { ViewBit } from "../../../bit/b_view";
import { ElbeDialog } from "../../../elbe/components";
import { RotateCcw, Settings2 } from "lucide-react";
import { VizFilter, VizFilters, vizFilters } from "./d_filter";
import { EventsBit } from "../../../bit/b_events";
import { useEffect } from "preact/hooks";

export function FilterView({ live = true }: { live?: boolean }) {
  return (
    <div class="card secondary">
      {
        <div class="row main-space-between">
          <_FilterView filters={vizFilters} />

          {live && <_LiveView />}
        </div>
      }
    </div>
  );
}

function _LiveView() {
  const liveSig = useSignal(false);
  const evSig = EventsBit.use().signal;

  useEffect(() => {
    const id = setInterval(() => {
      liveSig.value = evSig.peek().data?.requestedAt > Date.now() - 30 * 1000;
    }, 1000);
    return () => clearInterval(id);
  }, [evSig]);

  return liveSig.value ? (
    <div class="row live-label">
      live <div class="live-dot" />
    </div>
  ) : (
    <div />
  );
}

function _FilterView({ filters }: { filters: VizFilters }) {
  const openSig = useSignal(false);
  return (
    <div class="row cross-stretch">
      <div class="row main-space-between">
        <button class="action" onClick={() => (openSig.value = true)}>
          <Settings2 />
          Filter
        </button>
        <_FilterDialog
          open={openSig.value}
          onClose={() => (openSig.value = false)}
          filters={filters}
        />
      </div>
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
  filters: VizFilters;
}) {
  const viewBit = ViewBit.use();
  return (
    <ElbeDialog title="Filter" open={open} onClose={onClose}>
      <div class="column cross-stretch-fill" style="width: min(90vw, 25rem)">
        {Object.keys(filters).length == 0 && (
          <div class="padded centered">no filters available</div>
        )}
        {viewBit.map({
          onData: (view) => {
            return Object.keys(filters).map((k) => {
              const filter = filters[k];
              const val = view.filter?.[k];
              return (
                <_FilterEntry
                  filter={filter}
                  value={val}
                  onChange={(v) => viewBit.ctrl.setFilter(k, v)}
                />
              );
            });
          },
        })}
      </div>
    </ElbeDialog>
  );
}

function _FilterEntry({
  filter,
  value,
  onChange,
}: {
  filter: VizFilter;
  value: any;
  onChange: (v: any) => void;
}) {
  return (
    <div class="row main-space-between">
      <span class="b flex-1" style={value ? "" : "opacity: 0.5"}>
        {filter.label}
      </span>
      <input
        type={filter.type}
        style="width: 12rem"
        value={
          !!value ? (filter.type == "date"
            ? new Date(value).toISOString().slice(0, 10)
            : value) : ""
        }
        onInput={(e) => {
          const v = e.currentTarget.value;
          onChange(filter.type === "date" ? new Date(v).getTime() : v);
        }}
      />
      {value ? (
        <button
          class="integrated"
          style="width: 3rem"
          onClick={() => onChange(null)}
        >
          <RotateCcw />
        </button>
      ) : (
        <div style="width: 3rem" />
      )}
    </div>
  );
}
