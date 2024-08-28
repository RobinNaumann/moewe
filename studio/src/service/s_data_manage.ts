import { ApiService } from "./s_api";

export class ManageDataService {
  static readonly i = new ManageDataService();

  private constructor() {}

  getConfig() {
    return ApiService.i.get("/manage/config");
  }

  getMetrics() {
    return ApiService.i.get("/manage/metrics");
  }
}
