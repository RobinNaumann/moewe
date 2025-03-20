import { TrendingUp } from "lucide-react";
import { ApiEvent } from "../../../../shared";
import { groupBy } from "../../../../util/event_util";
import { Visualization, VizContext } from "../../../../util/viz/v_viz";
import { findTimeRange } from "./vv_chart_time";

const defaultOptions = {};

export const sessionsGraphViz: Visualization<typeof defaultOptions> = {
  id: "sessions_graph",
  types: ["event"],
  label: "Sessions Overview",
  icon: <TrendingUp />,
  options: [],
  defaults: defaultOptions,
  builder: (c) => _Viz({ c, count: 50 }),
};

function _Viz({
  c,
  count,
}: {
  c: VizContext<ApiEvent, typeof defaultOptions>;
  count: number;
}) {
  const events: ApiEvent[] = c.events;
  // Calculate the time range of events
  const range = findTimeRange(c.filter);

  // Calculate the time interval for each bucket
  const interval = ((range.end ?? Date.now()) - range.start) / count;

  // Split events into buckets
  const buckets: ApiEvent[][] = [];
  for (let i = 0; i < count; i++) {
    const startTime = range.start + i * interval;
    const endTime = range.start + (i + 1) * interval;
    const bucket = events.filter(
      (event) =>
        (i == 0 || event.meta.created_at > startTime) &&
        event.meta.created_at <= endTime
    );
    buckets.push(bucket);
  }

  const sessionCounts = buckets.map(
    (bucket) => groupBy(bucket, (e) => e.meta.session).length
  );

  return (
    <div class="column cross-stretch">
      <_ColumnDiagram buckets={sessionCounts} untilNow={!range.end} />
    </div>
  );
}

function _ColumnDiagram({
  buckets,
  untilNow,
}: {
  buckets: number[];
  untilNow: boolean;
}) {
  const max = Math.max(...buckets);
  return (
    <div
      class="row cross-stretch main-space-between gap-none"
      style="height: 110px; gap: 3px;"
    >
      {buckets.map((bucket, i) => (
        <div
          class={
            "flex-1 column cross-stretch main-end " +
            (untilNow && i == buckets.length - 1 ? " live-pulse" : "")
          }
        >
          <div
            class="column"
            title={bucket.toString() + " sessions"}
            style={{
              backgroundColor: "var(--c-accent)",
              height: `${(bucket / max) * 100}%`,

              borderRadius: "0.125rem",
            }}
          ></div>
        </div>
      ))}
    </div>
  );
}
