import { AuthService } from "../service/s_auth";
import { ApiDefinition } from "../server/docu";
import { DataService } from "../service/s_data";
import { appInfo } from "../app";
import { Account } from "../service/model/m_account";

const createRoutes: ApiDefinition[] = appInfo.config.allowRegistration
  ? [
      {
        method: "post",
        path: "/create",
        description:
          "lets an unauthenticated user create an account.\n\nThis is only allowed if the server is configured to allow registration.\nSet `ALLOW_USER_SIGNUP=true`",
        reqBody: {
          description: "user data",
          properties: {
            email: "string",
            name: "string",
            password: "string",
          },
          examples: {
            test: {
              email: "robin@mail.org",
              name: "Rob",
              password: "12345678",
            },
          },
        },
        worker: (body: Partial<Account>) => {
          const id = DataService.i.setAccount(null, {
            id: "-",
            email: body.email,
            name: body.name,
            password: body.password,
            privilege: 1,
            verified: false,
          });
          return { id: id, message: "account created" };
        },
      },
    ]
  : [];

export const routesAuth: ApiDefinition[] = [
  ...createRoutes,
  {
    method: "post",
    path: "/login",
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
  },
  {
    path: "/",
    description: "get the current user",
    workerAuthed: (user) => {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        privilege: user.privilege,
      };
    },
  },
  {
    path: "/logout",
    description: "Logout",
    handler: (req, res) => {
      //TODO: delete the token from the auth service
      res.clearCookie("token").send("logged out");
    },
  },
];
