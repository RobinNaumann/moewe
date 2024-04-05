import { ApiService } from "./s_api";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  privilege: number;
}

export type AuthState = AuthUser | null;

export class AuthService {
  public static i = new AuthService();
  private constructor() {}

  async get(): Promise<AuthState> {
    try{
      return await ApiService.i.get("/auth") as AuthUser;  
    } catch(e){
      console.log("auth error", e);
      return null;
    }
  }

  async logout() {
    // delete the token http-only cookie:
    await ApiService.i.get("/auth/logout");
  }

  async login({username, password}: {username: string, password: string}): Promise<void> {
    await ApiService.i.post("/auth/login", {body: {email:username, password}});
  }

  async create({email, password, name}: {email: string, password: string, name: string}): Promise<void> {
    await ApiService.i.post("/auth/create", {body: {email, password, name}});
  }
}
