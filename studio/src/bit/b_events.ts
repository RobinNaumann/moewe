import { DataService } from "../service/s_data";
import { showToast } from "../util";
import { CtrlBit, StreamControl, WorkerControl } from "../util/bit/ctrl_bit";
import { ViewFilter } from "../util/viz/v_viz";


interface _ApiEvent<T> {
  id: string;
  app: string;
  type: string;
  key: string | null;
  meta: {
    created_at: number;
    session: string | null;
    device: {
      platform: string | null;
      device: string | null;
      version: string | null;
    };
    location: {
      city: string | null;
      country: string | null;
      lat: number | null;
      lon: number | null;
    };
  };
  data: T;
}
export interface ApiEvent extends _ApiEvent<any> { }



type Inputs = { project: string, type: string, filter: ViewFilter };
type Data = { events: ApiEvent[], requestedAt: number, live: boolean };

class Ctrl extends StreamControl<Inputs, Data, number> {

  listen() {
    this._load();
    return setInterval(() => this._load(), 30 * 1000);
  }

  toggleLive(): void {
    this.act(async (d) => {
      const n = { ...d, live: !d.live };
      this.bit.emit(n);
    });
  }

  private async _load() {
    try {
      const d = this.bit.signal.peek().data;
      if (d) {
        if (!d.live) return;
        if (d.requestedAt > Date.now() - 20 * 1000) return;
      }
      const events = await DataService.i.listEvent(this.p.project, { type: this.p.type, ...this.p.filter });
      this.bit.emit({ events, requestedAt: Date.now(), live: d?.live ?? true });

    } catch (e) {
      this.bit.emitError(e);
    }
  }

  async delete(id: string): Promise<void> {
    this.act(async (d) => {
      try {
        await DataService.i.deleteEvent(id);
        const events = d.events.filter((e) => e.id !== id);
        this.bit.emit({ ...d, events });
      } catch (e) {
        showToast("Failed to delete event");
      }
    });
  }

  disposeStream(stream: number): void {
    clearInterval(stream);
  }
}

export const EventsBit = CtrlBit<Inputs, Data, Ctrl>(
  (p, b) => new Ctrl(p, b),
  "Events"
);
