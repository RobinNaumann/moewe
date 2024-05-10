import { DataService, Project } from "../service/s_data";
import { log } from "../util";
import { CtrlBit, WorkerControl } from "../util/bit/ctrl_bit";
import { ViewConfig } from "../util/viz/v_viz";

type FlagValue = string | number | boolean;

export interface App {
  id: string;
  project: string;
  name: string;
  config: {[key: string]: FlagValue};
}

type Inputs = { projectId: string };
type Data = App[];

class Ctrl extends WorkerControl<Inputs, Data> {
  async worker() {
    return  DataService.i.listApp(this.p.projectId);
  }

  async addApp(name: string) {
    await DataService.i.setApp(this.p.projectId, null,{name, config: {}});
    this.reload();
  }

  async deleteApp(id: string) {
    await DataService.i.deleteApp(this.p.projectId,id);
    this.reload();
  }

  setFlag(appId: string, key:string, value: FlagValue | null) {
    this.act(async (apps) => {
      const app = apps.find((a) => a.id == appId);
      if(!app) return log.debug("AppsBit: could not find app with this id");
      let config = {...app.config};
      config[key] = value;
      config = Object.fromEntries(Object.entries(config).filter(([k,v]) => v !== null));
      await DataService.i.setApp(this.p.projectId,appId, {config});
      this.reload();
    })
  }
}

export const AppsBit = CtrlBit<Inputs, Data, Ctrl>(
  (p, b) => new Ctrl(p, b),
  "Apps"
);
