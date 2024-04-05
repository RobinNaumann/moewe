import { DataService, Project } from "../service/s_data";
import { CtrlBit, WorkerControl } from "../util/bit/ctrl_bit";



type Inputs = { };
type Data = {onTap?: ()=>void};

class Ctrl extends WorkerControl<Inputs, Data> {
  async worker() {return  null;}
}

export const ProjectBit = CtrlBit<Inputs, Data, Ctrl>(
  (p, b) => new Ctrl(p, b),
  "Project"
);
