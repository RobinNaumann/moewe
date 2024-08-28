import {
  Clock,
  Globe2,
  KeyIcon,
  MousePointerClick,
  TabletSmartphone,
} from "lucide-react";
import { ApiEvent } from "../../../shared";
import { pastelColorFromString } from "../../../util";
import { humanId } from "../../../util/u_hash_to_human";

export function LocationChip({ event }: { event: ApiEvent }) {
  return (
    _NoData(event?.meta?.location?.country, event?.meta?.location?.city) ?? (
      <div class="row gap-half">
        <Globe2 />
        <div class="column cross-stretch gap-none">
          <div class="">{event.meta.location.country}</div>
          <div class="b text-s">{event.meta.location.city ?? ""}</div>
        </div>
      </div>
    )
  );
}

export function KeyChip({ event }: { event: ApiEvent }) {
  return _StringChip(event.key, <KeyIcon />);
}

export function SessionChip({
  event,
  value,
}: {
  event?: ApiEvent;
  value?: string;
}) {
  return _StringChip(
    humanId(event?.meta?.session ?? value),
    <MousePointerClick />
  );
}

export function DateChip({ event }: { event: ApiEvent }) {
  return (
    _NoData(event?.meta?.created_at) ?? (
      <div class="row gap-half">
        <Clock />
        <div class="column cross-stretch gap-none">
          <div class="">
            {new Date(event.meta.created_at).toLocaleTimeString()}
          </div>
          <div class="b text-s">
            {new Date(event.meta.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    )
  );
}

export function DeviceChip({ event }: { event: ApiEvent }) {
  return (
    _NoData(event?.meta?.device?.device, event?.meta?.device?.platform) ?? (
      <div class="row gap-half">
        <TabletSmartphone />
        <div class="column cross-stretch gap-none">
          <div class="">{event.meta.device.platform ?? ""}</div>
          <div class="b text-s">{event.meta.device.device ?? ""}</div>
        </div>
      </div>
    )
  );
}

function _StringChip(label: string, icon: any) {
  return (
    _NoData(label) ?? (
      <div
        class="secondary row gap-half"
        style={{
          backgroundColor: pastelColorFromString(label),
          borderRadius: "1.5rem",
          padding: ".25rem 1rem",
          minHeight: "2.5rem",
        }}
      >
        {icon}
        {label}
      </div>
    )
  );
}

function _NoData(...values: any[]) {
  if (values.some((v) => v != null)) return null;
  return (
    <div class="column cross-center">
      <div class="text-xl">—</div>
    </div>
  );
}
