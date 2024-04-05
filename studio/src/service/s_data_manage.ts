import { ApiEvent } from "../bit/b_events";
import { ProjectMember, ReadProjectMember } from "../bit/b_members";
import { ViewFilter } from "../util/viz/v_viz";
import { ApiService } from "./s_api";



export class ManageDataService{
static readonly i = new ManageDataService();

private constructor() {};

    getConfig(){
        return ApiService.i.get('/manage/config');
    }


    getMetrics(){
        return ApiService.i.get('/manage/metrics');
    }
}