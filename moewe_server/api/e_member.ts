import { ApiParameter, DonauRoute, routeAuthed } from "donau";
import { memberPublicType } from "../service/model/m_member";
import { AuthUser } from "../service/s_auth";
import { DataService } from "../service/s_data";
import { admin, guard, projectMember } from "../tools/guard";

const _projectParam: ApiParameter = {
  name: "pId",
  in: "path",
  required: true,
  description: "the id of the project",
  type: "string",
};

export const routesMember: DonauRoute<AuthUser>[] = [
  routeAuthed("/list", {
    description: "get a list of all members of a project",
    parameters: [_projectParam],
    workerAuthed: (user, pId) => {
      guard(user, admin, projectMember(pId));
      return DataService.i.listMembersRich(user.id, pId, 1, 100);
    },
  }),
  routeAuthed("/{mId}", {
    description: "get a single membership",
    parameters: [
      _projectParam,
      {
        name: "mId",
        in: "path",
        required: true,
        description: "the id of the member",
        type: "string",
      },
    ],
    workerAuthed: (user, pId, mId) => {
      guard(user, admin, projectMember(pId));
      return DataService.i.getMember(user.id, pId, mId);
    },
  }),
  routeAuthed("/{mId}?", {
    method: "post",
    description: "set a single membership",
    parameters: [
      _projectParam,
      {
        name: "mId",
        in: "path",
        required: false,
        description: "the id of the member",
        type: "string",
      },
    ],
    reqBody: {
      description: "project data",
      required: [],
      properties: memberPublicType,
    },
    workerAuthed: (
      user,
      body: Partial<{ account: string; role: string }>,
      pId,
      mId
    ) => {
      guard(user, admin, projectMember(pId));
      // todo: i think this is wrong
      return { id: DataService.i.setMember(user.id, pId ? pId : null, body) };
    },
  }),
  routeAuthed("/{mId}", {
    method: "delete",
    description: "delete a member",
    parameters: [
      _projectParam,
      {
        name: "mId",
        in: "path",
        required: true,
        description: "the id of the member",
        type: "string",
      },
    ],
    workerAuthed: (user, pId, mId) => {
      guard(user, admin, projectMember(pId));
      return DataService.i.deleteMember(user.id, pId, mId);
    },
  }),
];
