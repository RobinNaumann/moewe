import { DonauRoute, route, routeAuthed } from "donau";
import { appInfo } from "../app";
import { Account, accountType } from "../service/model/m_account";
import { AccountService } from "../service/s_account";
import { AuthService, AuthUser } from "../service/s_auth";

const createRoutes: DonauRoute<AuthUser>[] = appInfo.config.allowRegistration
  ? [
      route("/signup", {
        method: "post",
        description:
          "lets an unauthenticated user create an account.\n\nThis is only allowed if the server is configured to allow registration.\nSet `ALLOW_USER_SIGNUP=true`",

        reqBody: {
          description: "user data",
          required: ["email", "name", "password"],
          properties: accountType,
          examples: {
            test: {
              email: "robin@mail.org",
              name: "Rob",
              password: "12345678",
            },
          },
        },
        worker: (body: Partial<Account>) => {
          const id = AccountService.i.requestVerify(body);
          return { id: id };
        },
      }),
      route("/signup/verify", {
        description: "verify a new account email address with a code",
        parameters: [
          {
            name: "email",
            in: "query",
            required: true,
            description: "the email of the account",
            type: "string",
          },
          {
            name: "code",
            in: "query",
            required: true,
            description: "the verification code",
            type: "string",
          },
        ],
        worker: (email, code) => {
          const id = AccountService.i.verify(email, code);
          return { id: id };
        },
      }),
    ]
  : [];

export const routesAuth: DonauRoute<AuthUser>[] = [
  ...createRoutes,
  routeAuthed("/", {
    description: "get the current user",
    workerAuthed: (user) => {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        privilege: user.privilege,
      };
    },
  }),
  route("/login", {
    method: "post",
    description: "Login",
    reqBody: {
      description: "user credentials",
      properties: {
        email: "string",
        password: "string",
      },
      examples: {
        test: {
          email: "rob@mail.org",
          password: "12345678",
        },
      },
    },
    handler: (req, res) => {
      const { email, password }: any = req.body;
      const token = AuthService.i.login(email, password);
      res.cookie("token", token).send({ token });
    },
  }),

  route("/logout", {
    description: "Logout the current user",
    handler: (_, res) => res.clearCookie("token", { httpOnly: true }).end(),
  }),
];
