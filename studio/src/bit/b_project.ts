import { DataService, Project } from "../service/s_data";
import { CtrlBit, WorkerControl } from "../util/bit/ctrl_bit";
import { ViewConfig } from "../util/viz/v_viz";

type Inputs = { _id: string };
type Data = Project;

class Ctrl extends WorkerControl<Inputs, Data> {
  async worker() {
    return DataService.i.getProject(this.p._id, { expandSize: true });
  }

  async setName(name: string) {
    this.act(async (d) => {
      await DataService.i.setProject(this.p._id, { name });
      this.reload();
    });
  }

  async setAbout(about: string) {
    this.act(async (d) => {
      await DataService.i.setProject(this.p._id, { about });
      this.reload();
    });
  }

  async resetConfig() {
    this.act(async (d) => {
      await DataService.i.setProject(this.p._id, { config: {} });
      this.reload();
    });
  }

  async deleteProject() {
    this.act(async (d) => {
      await DataService.i.deleteProject(this.p._id);
    });
  }

  async setView(views: ViewConfig) {
    this.act(async (d) => {
      const c = { config: { ...d.config, view: views } };
      await DataService.i.setProject(this.p._id, c);
      //this.reload();
    });
  }
}

export const ProjectBit = CtrlBit<Inputs, Data, Ctrl>(
  (p, b) => new Ctrl(p, b),
  "Project"
);
