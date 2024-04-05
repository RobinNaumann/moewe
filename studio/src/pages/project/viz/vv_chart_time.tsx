import {
  BarChartBig,
  ListIcon,
} from "lucide-react";
import { ApiEvent, EventsBit } from "../../../bit/b_events";
import { ViewConfig, ViewFilter, Visualization, VizData, VizOption } from "../../../util/viz/v_viz";
import { Signal, useSignal } from "@preact/signals";

const oneDay = 24 * 60 * 60 * 1000;

const defaultOptions =  {};

interface _ChartValue{
  labels: _ChartColumn[];
  values: ApiEvent[][];
}

interface _ChartColumn{
  label: string;
  short: string;

}

export const chartTimeViz: Visualization<typeof defaultOptions> = {
  id: "charttime",
  types: "all",
  label: "Over Time",
  icon: <BarChartBig />,
  options: [],
  defaults: defaultOptions,
  builder: (d,o) => <_Viz options={o} _data={d} />,
};

const _dWeekdays: _ChartColumn[] = [
  {label: "Monday", short: "Mon"},
  {label: "Tuesday", short: "Tue"},
  {label: "Wednesday", short: "Wed"},
  {label: "Thursday", short: "Thu"},
  {label: "Friday", short: "Fri"},
  {label: "Saturday", short: "Sat"},
  {label: "Sunday", short: "Sun"},
];

const _modes = [
  {label: "by day", transformer: _DayTransformer},
  {label: "by weekday", transformer: _WeekTransformer},
  {label: "by hour", transformer: _HourTransformer},
];

function _Viz({ options, _data }: { options: typeof defaultOptions, _data: VizData<ApiEvent>}) {
  const modeSig = useSignal(0); 
  const m = _modes[modeSig.value];
  const data = m.transformer(_data.filter, _data.entries);
  return (
    <div class="column gap-double cross-stretch gap">
      <_ActionButtons modeSig={modeSig} />
      <_TimeChart data={data} />
    </div>
  );
}

function _ActionButtons({modeSig}: {modeSig: Signal<number>}) {
  return  <div class="row main-start">
  <div class="row gap-none card padding-none" style="overflow: hidden">

    {
      _modes.map((m, i) => <button class={`sharp ${modeSig.value === i ? "loud minor" : "action"}`} onClick={() => modeSig.value = i}>
        {m.label}</button>)
    }
    </div>
</div>;
}

 function _DayTransformer(filter: ViewFilter, data: ApiEvent[]): {labels: _ChartColumn[],values: ApiEvent[][]} {
  if(data.length === 0) return {labels: [], values: []};
  const first:number = filter?.["time_from"] ?? new Date(data[0].meta.created_at).getTime();
  const last = filter?.["time_to"] ?? Date.now();

  const days: ApiEvent[][] = [];
  const labels = [];

  for (let t = (new Date(first).setHours(0)); t <= last; t += oneDay) {
    days.push(data.filter((ev) => {
      const d = new Date(ev.meta.created_at);
      return d.getTime() >= t && d.getTime() < t + oneDay;
    }));
    const d = new Date(t);
    labels.push({label: d.toLocaleDateString(), short: d.toLocaleDateString().substring(0,5), key: t});
  }

  return {labels: labels, values: days};
 }

 function _WeekTransformer(_,data: ApiEvent[]): {labels: _ChartColumn[],values: ApiEvent[][]} {
  const vals = data.reduce((acc, ev) => {
    const week = new Date(ev.meta.created_at).getDay();
    for (let i = 0; i <= week; i++) if (!acc[i]) acc[i] = [];
    acc[week].push(ev);
    return acc;
  },[]);
  return {labels: _dWeekdays, values: vals};
}

 function _HourTransformer(_, data: ApiEvent[]): {labels: _ChartColumn[],values: ApiEvent[][]} {
  const vals = data.reduce((acc, ev) => {
    const hour = new Date(ev.meta.created_at).getHours();
    for (let i = 0; i <= hour; i++) if (!acc[i]) acc[i] = [];
    acc[hour].push(ev);
    return acc;
  },[]);

  const labels = Array.from({length: 24}, (_, i) => i).map((i) => {
    return {label: i.toString(), short: i.toString(), key: i};
  });

  return {labels: labels, values: vals};
}

function _TimeChart({ data }: { data: _ChartValue}) {
  // group data by week

  return <_ChartBodyView labels={data.labels} eventCount={data.values.map((w) => w.length)} />


}

function _ChartBodyView({labels, eventCount}: {labels: _ChartColumn[], eventCount: number[]}) { 
  let maxi = eventCount.reduce((acc, w) => Math.max(acc, w), 0);
  return <div class="row cross-stretch gap-half main-space-between"
  style="overflow-x: scroll; min-height: 10rem"
  >
    {
      labels.map((label, i) => <_ChartColumnView label={label} value={eventCount[i]} max={maxi} />)
    }
  </div>

}

function _ChartColumnView({ label, value, max }: { label: _ChartColumn; value: number, max: number}) {
  return <div class="column main-end gap-half flex-1 tooltipped">
    <div class="accent rounded" style={`height: ${(value/max) * 10}rem; width: min(100%, 3rem)`}></div>
    <div class="text-s b" >{label.short.toLocaleUpperCase()}</div>
    <div class="tooltip" style="bottom: 40%">{value}</div>
  </div>
}

/*
<div class="text-s b"
    style="margin-top: 0.5rem; width:1px; height: 3rem; transform: rotate(45deg) translateX(0.5rem) translateY(-0.5rem); transform-origin: 0 0; width: 1rem; text-align: center;"
    >{label.short.toLocaleUpperCase()}</div>
*/