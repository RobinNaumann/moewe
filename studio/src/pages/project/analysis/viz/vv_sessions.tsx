import { useSignal } from "@preact/signals";
import {
  ArrowLeftIcon,
  MousePointerClick,
  PlayIcon,
  SquareIcon,
} from "lucide-react";
import { ApiEvent } from "../../../../shared";
import { first } from "../../../../util";
import { EventGroup, groupBy } from "../../../../util/event_util";
import { Visualization, VizContext } from "../../../../util/viz/v_viz";
import {
  DateChip,
  DeviceChip,
  KeyChip,
  LocationChip,
  SessionChip,
} from "../v_event_chips";
import { DataDialogButton } from "./vv_event_list";

const defaultOptions = {};

export const sessionsViz: Visualization<typeof defaultOptions> = {
  id: "sessions",
  types: ["event"],
  label: "Sessions",
  icon: <MousePointerClick />,
  options: [],
  defaults: defaultOptions,
  builder: (c) => <_Viz c={c} />,
};

function _Viz({ c }: { c: VizContext<ApiEvent, typeof defaultOptions> }) {
  const selectSig = useSignal<EventGroup>(null);
  const groups = groupBy(c.events, (e) => e.meta.session);

  return selectSig.value ? (
    <div class="column cross-stretch">
      <div class="row">
        <button class="integrated" onClick={() => (selectSig.value = null)}>
          <ArrowLeftIcon />
        </button>
        <SessionChip value={selectSig.value.key} />
      </div>
      <_SessionViz group={selectSig.value} />
    </div>
  ) : (
    <div class="column cross-stretch">
      {groups.map((v) => (
        <div
          class="row main-space-between highlightable"
          onClick={() => (selectSig.value = v)}
        >
          <SessionChip value={v.key} />
          <DateChip event={first(v.items)} />
        </div>
      ))}
    </div>
  );
}

function _DelimIcon({ start }: { start: boolean }) {
  return (
    <div
      class="secondary row main-center"
      style={{
        borderRadius: "1.5rem",
        minHeight: "2.5rem",
        minWidth: "2.5rem",
      }}
      title={start ? "Session start" : "Session end"}
    >
      {start ? <PlayIcon /> : <SquareIcon />}
    </div>
  );
}

function _minuteDiff(a: ApiEvent, b: ApiEvent) {
  if (!a.meta.created_at || !b.meta.created_at) return null;
  return Math.round(
    (new Date(a.meta.created_at).getTime() -
      new Date(b.meta.created_at).getTime()) /
      1000 /
      60
  );
}

function _SessionViz({ group }: { group: EventGroup }) {
  return (
    <div class="column cross-stretch" style="position: relative;">
      <div
        class="secondary"
        style={{
          position: "absolute",
          zIndex: 5,
          top: 0,
          left: "1.125rem",
          bottom: 0,
          width: ".25rem",
          borderRadius: ".125rem",
        }}
      />
      <div class="column cross-stretch" style="z-index: 10;">
        <div class="row">
          <_DelimIcon start={true} />
          {group.items.length > 0 && (
            <div class="flex-1 row scroll bar-outside gap-3">
              <DateChip event={group.items[0]} />
              <DeviceChip event={group.items[0]} />
              <LocationChip event={group.items[0]} />
            </div>
          )}
        </div>
        {group.items.map((e, i, a) => (
          <div class="row  highlightable">
            <div class="row" style="min-width: 12rem">
              <KeyChip event={e} />
            </div>
            <div class="flex-1">
              +{_minuteDiff(e, a[Math.max(0, i - 1)])} min.
            </div>
            <DataDialogButton event={e} />
          </div>
        ))}
        <div class="row main-space-between">
          <_DelimIcon start={false} />
        </div>
      </div>
    </div>
  );
}
