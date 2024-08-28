import { err } from "donau";
import { tables } from "../server/tables";
import { Account } from "./model/m_account";
import { AuthService } from "./s_auth";
import { DbService } from "./s_db";
import { MailService } from "./s_mail";

const _expiryMinutes = 30;

export class AccountService {
  static readonly i = new AccountService();

  private constructor() {}

  private _openVerifications: {
    [email: string]: {
      code: string;
      expires: number;
      account: {
        email: string;
        name: string;
        password: string;
      };
    };
  } = {};

  // ============== Account ==============

  /** Add a new user to the database
   * @param username The username of the user
   * @param password The password of the user
   **/
  set(id: string | null, account: Partial<Account>): string {
    if (!account) throw err.badRequest("no data provided");

    let data: any = {
      ...account,
      id: undefined,
      verified: undefined,
      privilege: undefined,
      pw_salt: undefined,
      pw_hash: undefined,
    };

    // sanitize input if a new account is created
    if (!id) {
      if (!data.email) throw err.badRequest("email is required");
      if (!data.password) throw err.badRequest("password is required");
      if (!data.name) throw err.badRequest("name is required");

      data = {
        email: data.email,
        name: data.name,
        password: data.password,
        verified: false,
        privilege: 1,
      };
    } else {
      if (data.email) throw err.badRequest("email cannot be changed");
    }

    if (data.password) {
      data.pw_salt = AuthService.i.generateSalt();
      data.pw_hash = AuthService.i.hashPassword(data.password, data.pw_salt);
    }

    return DbService.i.set(tables.account, id, data);
  }

  /** Get the data of an account
   * @param id The id of the account
   */
  get(id: string): Account {
    return DbService.i.get(tables.account, id);
  }

  getByEmail(email: string): Account {
    return DbService.i.getQuery(tables.account, {
      where: "email = $email",
      params: { $email: email },
    });
  }

  list(filter: any, page: number, pageSize: number) {
    return DbService.i.list(tables.account, filter, page, pageSize);
  }

  delete(id: string) {
    DbService.i.delete(tables.account, id);
  }

  verify(email: string, code: string) {
    // delete expired verifications
    for (const email in this._openVerifications) {
      if (this._openVerifications[email].expires < Date.now()) {
        delete this._openVerifications[email];
      }
    }

    const verification = this._openVerifications[email];
    if (!verification) throw err.badRequest("no verification found");
    if (verification.code !== code) throw err.badRequest("invalid code");

    return this.set(null, { ...verification.account, privilege: 1 });
  }

  requestVerify(account: Partial<Account>) {
    if (!account.email || !account.name || !account.password)
      throw err.badRequest("email, name, password are required");

    if (
      this._openVerifications[account.email]?.expires >
      Date.now() - 1000 * 30
    ) {
      throw err.badRequest(
        "verification already requested. " +
          "Please wait 30 seconds before trying again."
      );
    }

    const code = AuthService.i.generate6DigitCode();
    this._openVerifications[account.email] = {
      code: code,
      expires: Date.now() + 1000 * 60 * _expiryMinutes,
      account: {
        email: account.email,
        name: account.name,
        password: account.password,
      },
    };

    MailService.i.send(
      account.email,
      "Verification code",
      `
thank you for signing up to mœwe. 
Your verification code is: 

${code}

The code expires in ${_expiryMinutes} minutes.
If you did not request this code, please ignore this email.

Best regards,
mœwe team
      `
    );
  }
}
