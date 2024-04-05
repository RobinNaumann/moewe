export const tables = {
  account: {
    _name: "account",
    id: "TEXT",
    email: "TEXT",
    name: "TEXT",
    privilege: "INTEGER",
    pw_hash: "TEXT",
    pw_salt: "TEXT",
  },
  project: {
    _name: "project",
    id: "TEXT",
    name: "TEXT",
    about: "TEXT",
    created_at: "INTEGER",
    config: "TEXT",
  },
  role: {
    _name: "role",
    account: "TEXT",
    project: "TEXT",
    role: "TEXT",
  },
  event:{
    _name: "event",
    id: "TEXT",
    project: "TEXT",
    type: "TEXT",
    key: "TEXT",
    created_at: "INTEGER",
    meta: "JSON",
    data: "JSON",
  }
};
