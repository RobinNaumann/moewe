import { appInfo } from "../app";
import { DbService } from "./s_db";

export interface ServerMetric {
    label: string;
    value: any;
    unit?: string;
}

export class ManageDataService {
    static readonly i = new ManageDataService();
  
    private constructor() {}

    getServerConfig(){
        return {...appInfo, auth: "<omitted for security reasons>"};
    }

    //retrieve the size of the database and the number of entries in each collection
    getServerMetrics(): { [key: string]: ServerMetric} {
        const dbSize =  DbService.i.query("SELECT page_count * page_size as c FROM pragma_page_count(), pragma_page_size()")[0].c;
        const events = DbService.i.query("SELECT count(*) as c FROM event")[0].c;
        const accounts = DbService.i.query("SELECT count(*) as c FROM account")[0].c;
        const projects = DbService.i.query("SELECT count(*) as c FROM project")[0].c;

        return {
            dbSize: {label: "database size", value: Math.round(dbSize/1000), unit: "kB"},
            events: {label: "# of events", value: events},
            accounts: {label: "# of accounts", value: accounts},
            projects: {label: "# of projects", value: projects},

        };

    }

}  