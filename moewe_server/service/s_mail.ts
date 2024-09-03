import { logger } from "donau";
import { SMTPClient } from "emailjs";
import { appInfo } from "../app";

export class MailService {
  static readonly i = new MailService();
  private _client: SMTPClient | null = null;

  private constructor() {}

  init() {
    this._client = new SMTPClient({
      user: appInfo.email.address,
      password: appInfo.email.password,
      host: appInfo.email.host,
      ssl: true,
    });
  }

  async send(to: string, subject: string, body: string) {
    if (!this._client) this.init();
    try {
      const message = await this._client!.sendAsync({
        text: body.trim(),
        from: `mœwe <${appInfo.email.address}>`,
        to: to,
        bcc:
          appInfo.config.registrationSendCopy && appInfo.config.contactEmail
            ? appInfo.config.contactEmail
            : undefined,
        subject: subject,
      });
      return true;
    } catch (err) {
      logger.warning("Error sending email: " + err);
      return false;
    }
  }
}
