import { Database } from "bun:sqlite";
import crypto from "crypto";
import { err, logger } from "donau";
import fs from "node:fs";
import { appInfo } from "../app";

export interface DbFilter {
  /**
   * The query to execute. this overrides the where clause
   */
  query?: string;
  where?: string;
  params: any;
}

export interface Table {
  _name: string;
  [key: string]: string;
}

export class DbService {
  private _db!: Database;

  static readonly i = new DbService();

  private constructor() {}

  init() {
    try {
      new Database(appInfo.server.db, { create: false, readonly: true });
    } catch (e) {
      logger.warning("Database not found, creating new one");
      this._createDb(appInfo.server.db);
      logger.success("created new database at " + appInfo.server.db);
    }
    this._db = new Database(appInfo.server.db);
  }

  private _createDb(path: string) {
    const query = fs.readFileSync("./db/template/create_data.sql", "utf8");
    let db = new Database(appInfo.server.db, { create: true, readwrite: true });
    logger.debug("creating new database at " + appInfo.server.db);
    db.run(query);
    db.close();
  }

  /** Add/update an entry in the sqlite database at /db/data.db
   * @returns The id of the entry
   **/
  set(table: Table, id: string | null, data: any): string {
    const cData: any = this._deflate(table, { ...data, verified: false });

    // Insert the user into the database
    return id ? this._update(table, cData, id) : this._insert(table, cData);
  }

  /** Get the data of an entry
   * @param id The id of the entry
   */
  get(table: Table, id: string): any {
    const query = `SELECT * FROM ${table._name} WHERE id = ?`;
    return this._inflate(table, this._db.query(query).get(id));
  }

  getQuery(table: Table, filter: DbFilter): any {
    const query =
      filter.query ??
      `SELECT * FROM ${table._name} WHERE ${filter.where ?? "1=1"}`;
    return this._inflate(table, this._db.query(query).get(filter.params));
  }

  listQuery(
    table: Table,
    filter: DbFilter,
    page: number,
    pageSize: number
  ): any[] {
    const query =
      (filter.query ??
        `SELECT * FROM ${table._name} WHERE ${filter.where ?? "1=1"}`) +
      " LIMIT $limit OFFSET $offset";
    return this._inflateList(
      table,
      this._db.query(query).all({
        ...filter.params,
        $limit: pageSize,
        $offset: (page - 1) * pageSize,
      })
    );
  }

  query(query: string, params?: any): any[] {
    return this._db.query(query).all(params ?? {});
  }

  delete(table: Table, id: string): void {
    const query = `DELETE FROM ${table._name} WHERE id = ?`;
    this._db.query(query).run(id);
  }

  deleteQuery(table: Table, filter: DbFilter): void {
    const query =
      filter.query ??
      `DELETE FROM ${table._name} WHERE ${filter.where ?? "1=1"}`;
    this._db.query(query).run(filter.params);
  }

  /** list all entries in a table in a paginated way
   * @param table The table to list
   * @param filter A filter to apply to the list
   * @param page The page to list
   * @param pageSize The size of the page
   */
  list(
    table: Table,
    filter: DbFilter | null,
    page: number,
    pageSize: number
  ): any[] {
    filter = filter ?? { where: "1 = 1", params: {} };

    //remove unused entries from params:
    for (let key of Object.keys(filter?.params ?? {})) {
      if (!(filter.where?.includes(key) ?? true)) {
        delete filter.params[key];
      }
    }

    const query =
      (filter.query ??
        `SELECT * FROM ${table._name} WHERE ${filter.where ?? "1=1"}`) +
      " LIMIT $limit OFFSET $offset";
    return this._inflateList(
      table,
      this._db.query(query).all({
        ...filter.params,
        $limit: pageSize,
        $offset: (page - 1) * pageSize,
      })
    );
  }

  private _update(table: Table, data: object, id: string): string {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const query = `UPDATE ${table._name} SET ${keys
      .map((key) => `${key} = ?`)
      .join(",")} WHERE id = ?`;
    this._db.run(query, [...values, id]);
    return id;
  }

  private _insert(table: Table, data: object): string {
    const newId = this._makeId();
    if (table.id) (data as any).id = newId;
    const keys = Object.keys(data);
    const values = Object.values(data);
    const query = `INSERT INTO ${table._name} (${keys.join(",")}) VALUES (${keys
      .map(() => "?")
      .join(",")})`;
    this._db.run(query, values);
    return newId;
  }

  private _makeId() {
    return crypto.randomBytes(8).toString("hex");
  }

  private _deflate(table: Table, data: any) {
    const keys = Object.keys(table).filter(
      (key) => key.startsWith("_") === false
    );
    const result: any = {};
    keys.forEach((key: string) => {
      if (data[key] !== undefined) {
        result[key] =
          table[key] === "JSON" ? JSON.stringify(data[key]) : data[key];
      }
    });
    return result;
  }

  private _inflate(table: Table, data: any): any {
    if (!data) throw err.notFound("entry not found");
    const keys = Object.keys(table).filter(
      (key) => key.startsWith("_") === false
    );
    const result: any = {};
    keys.forEach((key: string) => {
      result[key] = table[key] === "JSON" ? JSON.parse(data[key]) : data[key];
    });
    return result;
  }

  private _inflateList(table: Table, data: any[]): any[] {
    return data.map((row) => this._inflate(table, row));
  }
}
