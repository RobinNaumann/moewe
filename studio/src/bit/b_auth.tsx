
import { route } from "preact-router";
import { AuthService, AuthState } from "../service/s_auth";
import { go } from "../util";
import { CtrlBit,  WorkerControl } from "../util/bit/ctrl_bit";

type Inputs = {};
type Data = AuthState;

class Ctrl extends WorkerControl<Inputs, Data> {
  worker(): Promise<AuthState> {
    return AuthService.i.get();
  }
  


  login = async (d:{username:string, password:string} ): Promise<void> => {
    //this.bit.emitLoading();
     await AuthService.i.login(d);
     this.reload();
     route("/");
    
  };

  logout = async (): Promise<void> => {
    try{
    await AuthService.i.logout();
    }catch(e){
      console.error(e);
    }
    this.reload();
    route("/login");
  }
}

export const AuthBit = CtrlBit<Inputs, Data, Ctrl>(
  (p, b) => new Ctrl(p, b),
  "Auth"
);
