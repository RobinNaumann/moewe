import chalk from "chalk";

class Log {
  private _log(label: string, style: (msg: string) => void, message: any) {
    if(!message) return;
    if(!Array.isArray(message)) message = [message];

    for (let i = 0; i < message.length; i++) {
      if (typeof message[i] == "object") {
        console.log(message[i]);
        continue;
      }
      console.log(style((i == 0 ? `[${label}]` : "").padEnd(12) + `${message[i]}`));
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
