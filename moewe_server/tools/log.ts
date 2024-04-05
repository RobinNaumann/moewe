import chalk from "chalk";

class Log {
  private _log(label: string, style: (msg: string) => void, message: any) {
    if(!message) return;
    if(!Array.isArray(message)) message = [message];

    for (let m of message) {
      if (typeof m == "object") {
        console.log(message);
        continue;
      }
      console.log(style(`[${label}]`.padEnd(12) + `${m}`));
    }
  }

  public success = (...msg: any) => this._log("SUCCESS", chalk.green, msg);
  public info = (...msg: any) => this._log("INFO", chalk.blue, msg);
  public debug = (...msg: any) => this._log("DEBUG", chalk.gray, msg);
  public warning = (msg: any) => this._log("WARNING", chalk.yellow, msg);
  public error = (...msg: any) => this._log("ERROR", chalk.red, msg);
  public fatal = (...msg: any) =>
    this._log("FATAL", chalk.bgRed.white.bold, msg);
}

export const logger = new Log();
