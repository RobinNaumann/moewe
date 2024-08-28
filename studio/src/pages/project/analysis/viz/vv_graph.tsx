import { ActivityIcon } from "lucide-react";
import { ApiEvent } from "../../../../shared";
import { last, ResCanvas, ResCanvasSize, showDate } from "../../../../util";
import { groupBy } from "../../../../util/event_util";
import { Visualization, VizContext } from "../../../../util/viz/v_viz";
import { findTimeRange } from "./vv_chart_time";

const defaultOptions = {};

export const overviewGraphViz: Visualization<typeof defaultOptions> = {
  id: "overview_graph",
  types: ["event"],
  label: "Overview",
  icon: <ActivityIcon />,
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
  console.log(range);

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

  console.log(buckets.reduce((acc, bucket) => acc + bucket.length, 0));

  return (
    <div class="column cross-stretch">
      <_ColumnDiagram buckets={buckets} />
    </div>
  );
}

function _ColumnDiagram({ buckets }: { buckets: ApiEvent[][] }) {
  const max = Math.max(...buckets.map((bucket) => bucket.length));
  return (
    <div
      class="row cross-stretch main-space-between gap-none"
      style="height: 110px; gap: 3px;"
    >
      {buckets.map((bucket, i) => (
        <_Column max={max} bucket={bucket} live={i === buckets.length - 1} />
      ))}
    </div>
  );
}

function _Column({
  max,
  bucket,
  live,
}: {
  max: number;
  bucket: ApiEvent[];
  live: boolean;
}) {
  const typeColors = {
    event: "var(--c-accent)",
    crash: "var(--c-error)",
  };

  const grouped = groupBy(bucket, (event) => event.type);

  return (
    <div
      class={
        "flex-1 column cross-stretch main-end gap-none" +
        (live ? " live-pulse" : "")
      }
      title={showDate(last(bucket)?.meta.created_at)}
      style={
        live
          ? {
              margin: "-0.25rem",
              padding: "0.25rem",
              borderRadius: "0.25rem",
            }
          : {}
      }
    >
      <div class="column cross-stretch main-end flex-1">
        {grouped.map((g) => (
          <div
            class="column cross-center"
            style={{
              backgroundColor: typeColors[g.key] || "#aaa",
              height: `${(g.items.length / max) * 100}%`,
              borderRadius: "0.125rem",
            }}
          ></div>
        ))}
      </div>
      <div
        class="secondary"
        style={{
          marginTop: ".125rem",
          height: ".125rem",
        }}
      />
    </div>
  );
}

function _LineDiagram({ buckets }: { buckets: ApiEvent[][] }) {
  function draw(ctx: CanvasRenderingContext2D, size: ResCanvasSize) {
    const maxItems = Math.max(...buckets.map((bucket) => bucket.length));
    const bucketWidth = size.width / buckets.length;
    const itemHeight = size.height / maxItems;

    ctx.clearRect(0, 0, size.width, size.height);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(10, size.height);
    ctx.lineTo(size.width, 0);
    ctx.stroke();

    /*buckets.forEach((bucket, index) => {
      const x = index * bucketWidth;
      const y = size.height - bucket.length * itemHeight;

      ctx.beginPath();
      ctx.moveTo(x, size.height);
      ctx.lineTo(x, y);
      ctx.stroke();
    });*/
  }

  return <ResCanvas height={150} draw={draw} padding={2} />;
}
