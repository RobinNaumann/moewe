import { route } from "preact-router";
import { ApiAccount, DataService, Project } from "../service/s_data";
import { CtrlBit, WorkerControl } from "../util/bit/ctrl_bit";
import { ViewConfig } from "../util/viz/v_viz";



type Inputs = { aId: string };
type Data = ApiAccount;

class Ctrl extends WorkerControl<Inputs, Data> {
  async worker() {
    return  DataService.i.getAccount(this.p.aId);
  }

  async setName(name: string) {
    await DataService.i.setAccount(this.p.aId, {name: name});
    this.reload();
  }

  async setPassword(password: string) {
    await DataService.i.setAccount(this.p.aId, {password: password});
    this.reload();
  }

  async delete(){
    await DataService.i.deleteAccount(this.p.aId);
    route("/");
  }
}

export const AccountBit = CtrlBit<Inputs, Data, Ctrl>(
  (p, b) => new Ctrl(p, b),
  "Account"
);
