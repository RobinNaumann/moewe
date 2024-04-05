import { DataService, Project } from "../service/s_data";
import { CtrlBit, WorkerControl } from "../util/bit/ctrl_bit";
import { ViewConfig } from "../util/viz/v_viz";


export interface ProjectMember{
  project: string;
  account: string;
  role: string;
}

export interface ReadProjectMember {
  project: string;
  account: {
    id: string;
    email: string;
  
  };
  role: string;
}


type Inputs = { pId: string };
type Data = ReadProjectMember[];

class Ctrl extends WorkerControl<Inputs, Data> {
  async worker() {
    return  DataService.i.listMembers(this.p.pId);
  }

  async set(account:string | null,m: Partial<ProjectMember>) {
    this.act(async (d) => {
      await DataService.i.setMember(this.p.pId, account, m);
      this.reload();
    });
  }

  async delete(account:string) {
    this.act(async (d) => {
      await DataService.i.deleteMember(this.p.pId, account);
      this.reload();
    });
  }
}

export const MembersBit = CtrlBit<Inputs, Data, Ctrl>(
  (p, b) => new Ctrl(p, b),
  "Members"
);
