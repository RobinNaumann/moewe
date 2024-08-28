import { DataService } from "../service/s_data";
import { ApiEvent, ApiFilters } from "../shared";
import { log, showToast } from "../util";
import { CtrlBit, StreamControl } from "../util/bit/ctrl_bit";

type Inputs = { project: string; type: string; filter: ApiFilters };
type Data = { events: ApiEvent[]; requestedAt: number; live: boolean };

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
      const events = await DataService.i.filteredEvent(
        this.p.project,
        this.p.type,
        this.p.filter
      );
      if (events.length <= d?.events.length) {
        log.debug("skip event update. no new events.");
      }
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
