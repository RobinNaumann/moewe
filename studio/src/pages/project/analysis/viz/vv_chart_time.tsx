import { Signal, useSignal } from "@preact/signals";
import { BarChartBig } from "lucide-react";
import { ApiEvent, ApiFilters } from "../../../../shared";
import { Visualization, VizContext } from "../../../../util/viz/v_viz";

const oneDay = 24 * 60 * 60 * 1000;

const defaultOptions = {};

interface _ChartValue {
  label: _ChartColumn;
  values: ApiEvent[];
}

interface _ChartColumn {
  label: string;
  short: string;
}

export function findTimeRange(filter: ApiFilters) {
  const dates = filter.filter((f) => (f as any).field === "meta.created_at");

  const starts = dates
    .filter((d: any) => [">", ">=", "="].includes(d.operator))
    .map((d: any) => d.value);
  const ends = dates
    .filter((d: any) => ["<", "<=", "="].includes(d.operator))
    .map((d: any) => d.value);

  const start = starts.length > 0 ? Math.max(...starts) : null;
  const end = ends.length > 0 ? Math.min(...ends) : null;
  if (!!start && !!end && start > end) return { start: null, end: null };
  return { start, end };
}

export const chartTimeViz: Visualization<typeof defaultOptions> = {
  id: "charttime",
  types: "all",
  label: "Over Time",
  icon: <BarChartBig />,
  options: [],
  defaults: defaultOptions,
  builder: (c) => <_Viz c={c} />,
};

const _dWeekdays: _ChartColumn[] = [
  { label: "Monday", short: "Mon" },
  { label: "Tuesday", short: "Tue" },
  { label: "Wednesday", short: "Wed" },
  { label: "Thursday", short: "Thu" },
  { label: "Friday", short: "Fri" },
  { label: "Saturday", short: "Sat" },
  { label: "Sunday", short: "Sun" },
];

const _modes = [
  { label: "by day", transformer: _DayTransformer },
  { label: "by weekday", transformer: _WeekTransformer },
  { label: "by hour", transformer: _HourTransformer },
];

function _Viz({ c }: { c: VizContext<ApiEvent, typeof defaultOptions> }) {
  const modeSig = useSignal(0);
  const m = _modes[modeSig.value];
  const data = m.transformer(c.filter, c.events);
  return (
    <div class="column gap-double cross-stretch gap">
      <_ActionButtons modeSig={modeSig} />
      <_ChartBodyView values={data} />
    </div>
  );
}

function _ActionButtons({ modeSig }: { modeSig: Signal<number> }) {
  return (
    <div class="row main-start">
      <div class="row gap-none card padding-none" style="overflow: hidden">
        {_modes.map((m, i) => (
          <button
            class={`sharp ${modeSig.value === i ? "loud minor" : "action"}`}
            onClick={() => (modeSig.value = i)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function _DayTransformer(filter: ApiFilters, data: ApiEvent[]): _ChartValue[] {
  const values: _ChartValue[] = [];
  const range = findTimeRange(filter);
  for (
    let i = range.start ?? Date.now() - 365 * 2 * oneDay;
    i < (range.end ?? Date.now());
    i += oneDay
  ) {
    const day = new Date(i);
    const dayEnd = new Date(i + oneDay);
    const dayEvents = data.filter((ev) => {
      const evDate = new Date(ev.meta.created_at);
      return evDate >= day && evDate < dayEnd;
    });
    values.push({
      label: { label: day.toDateString(), short: day.toLocaleDateString() },
      values: dayEvents,
    });
  }

  return values;
}

function _WeekTransformer(_, data: ApiEvent[]): _ChartValue[] {
  return _dWeekdays.map((d, i) => {
    const dayEvents = data.filter((ev) => {
      const evDate = new Date(ev.meta.created_at);
      return evDate.getDay() === i;
    });
    return { label: d, values: dayEvents };
  });
}

function _HourTransformer(_, data: ApiEvent[]): _ChartValue[] {
  return Array.from({ length: 24 }, (_, i) => {
    const dayEvents = data.filter((ev) => {
      const evDate = new Date(ev.meta.created_at);
      return evDate.getHours() === i;
    });
    return {
      label: { label: i.toString(), short: i.toString() },
      values: dayEvents,
    };
  });
}

function _ChartBodyView({ values }: { values: _ChartValue[] }) {
  let maxi = values.reduce((acc, w) => Math.max(acc, w.values.length), 0);
  return (
    <div
      class="row cross-stretch gap-half main-space-between"
      style="overflow-x: scroll; overflow-y: hidden ; min-height: 10rem; flex-direction: row-reverse; gap: 0.25rem;"
    >
      {values.reverse().map((v, i) => (
        <_ChartColumnView label={v.label} value={v.values.length} max={maxi} />
      ))}
    </div>
  );
}

function _ChartColumnView({
  label,
  value,
  max,
}: {
  label: _ChartColumn;
  value: number;
  max: number;
}) {
  return (
    <div class="column main-end gap-half flex-1 tooltipped">
      <div
        class="accent rounded"
        style={`height: ${(value / max) * 10}rem; width: min(100%, 3rem)`}
      ></div>
      <div
        class="text-s b"
        style="max-width: 35px; overflow-wrap: break-word; text-align: center;"
      >
        {label.short.toLocaleUpperCase()}
      </div>
      <div class="tooltip">{value}</div>
    </div>
  );
}

/*
<div class="text-s b"
    style="margin-top: 0.5rem; width:1px; height: 3rem; transform: rotate(45deg) translateX(0.5rem) translateY(-0.5rem); transform-origin: 0 0; width: 1rem; text-align: center;"
    >{label.short.toLocaleUpperCase()}</div>
*/
