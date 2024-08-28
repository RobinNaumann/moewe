import { ApiService } from "./s_api";

export interface SignUpAccount {
  name: string;
  email: string;
  password: string;
}

export class SignUpService {
  static readonly i = new SignUpService();

  private constructor() {}

  // get projects
  async request(acc: SignUpAccount): Promise<void> {
    if (!acc.email || !acc.name || !acc.password) {
      throw new Error("All fields are required.");
    }
    if (acc.password?.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    await ApiService.i.post("/auth/signup", { body: acc });
  }

  async verify(email: string, code: string): Promise<void> {
    await ApiService.i.get("/auth/signup/verify", {
      query: { email, code },
    });
  }
}
