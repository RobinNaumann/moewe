import crypto from "crypto";
import { err, sendError } from "donau";
import jwt from "jsonwebtoken";
import { appInfo } from "../app";
import { AccountService } from "./s_account";

export const userPrivileges = {
  guest: {
    id: 0,
    name: "guest",
    color: "#330000",
  },
  user: {
    id: 1,
    name: "user",
    color: "#550000",
  },
  admin: {
    id: 100,
    name: "admin",
    color: "#990000",
  },
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  privilege: number | null;
}

export class AuthService {
  static readonly i = new AuthService();
  private constructor() {}

  public comparePasswords(password: string, hash: string, salt: string) {
    return hash === this.hashPassword(password, salt);
  }

  public hashPassword(password: string, salt: string) {
    return this.hash(password, salt, 128, 10000);
  }
  public hash(
    value: string,
    salt: string,
    length: number = 16,
    rounds: number = 100
  ) {
    return crypto
      .pbkdf2Sync(value, salt, rounds, length, "sha512")
      .toString("hex");
  }
  public generateSalt() {
    return crypto.randomBytes(32).toString("hex");
  }

  public generate6DigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public middleware(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      sendError(res, err.notAuthorized("no token provided"));
      return;
    }

    jwt.verify(token, appInfo.auth.secret!, (err: any, user: any) => {
      if (err) return sendError(res, err.notAuthorized("token not valid"));
      req.user = user as AuthUser;
      next();
    });
  }

  public login(email: string, password: string): string {
    const acc = AccountService.i.getByEmail(email);
    if (!acc?.pw_hash || !acc?.pw_salt)
      throw err.notAuthorized("User not found");

    //if (acc.verified === false) throw new Error("User not verified");

    if (!this.comparePasswords(password, acc.pw_hash, acc.pw_salt)) {
      throw err.notAuthorized("Password wrong");
    }

    return jwt.sign(
      {
        id: acc.id,
        name: acc.name,
        email: acc.email,
        privilege: acc.privilege,
      } as AuthUser,
      appInfo.auth.secret!
    );
  }
}
