import { DataService } from "../service/s_data";
import { CtrlBit, StreamControl, WorkerControl } from "../util/bit/ctrl_bit";
import { ViewFilter } from "../util/viz/v_viz";


export interface ApiEvent {
  id: string;
  project: string;
  type: string;
  key: string | null;
  meta: {
    created_at: number;
    session: string | null;
    device: {
      platform: string | null;
      device: string | null;
    };
    location: {
      city: string | null;
      country: string | null;
      lat: number | null;
      lon: number | null;
    };
  };
  data: any;
}



type Inputs = { project: string, type: string, filter: ViewFilter};
type Data = {events: ApiEvent[], requestedAt: number};

class Ctrl extends StreamControl<Inputs, Data, number> {
  
  listen() {
    this._load();
    return setInterval(() => this._load(), 5 * 1000);
  }

  private async _load(){
    try{
      const events = await DataService.i.listEvent(this.p.project, {type: this.p.type, ...this.p.filter});
      this.bit.emit({events, requestedAt: Date.now()});
    }catch(e){
      this.bit.emitError(e);
    }
  }

  disposeStream(stream: number): void {
    clearInterval(stream);
  }
}

export const EventsBit = CtrlBit<Inputs, Data, Ctrl>(
  (p, b) => new Ctrl(p, b),
  "Events"
);
