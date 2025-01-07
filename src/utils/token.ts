import { env } from "bun";
import crypto from "crypto";

export class TokenUtil {
  private static instance: TokenUtil;
  private secret: string;

  private constructor() {
    this.secret = crypto.randomBytes(32).toString("hex");
  }

  public static getInstance(): TokenUtil {
    if (!TokenUtil.instance) {
      TokenUtil.instance = new TokenUtil();
    }
    return TokenUtil.instance;
  }

  async createToken(payload: Record<string, any>): Promise<string> {
    const header = { alg: "HS256", typ: "JWT" };
    const currentTime = Math.floor(Date.now() / 1000);
    const claims = {
      ...payload,
      iat: currentTime,
      exp: currentTime + 24 * 60 * 60,
    };

    const base64Header = Buffer.from(JSON.stringify(header)).toString(
      "base64url"
    );
    const base64Payload = Buffer.from(JSON.stringify(claims)).toString(
      "base64url"
    );

    const signature = crypto
      .createHmac("sha256", this.secret)
      .update(`${base64Header}.${base64Payload}`)
      .digest("base64url");

    return `${base64Header}.${base64Payload}.${signature}`;
  }

  async verifyToken(token: string): Promise<Record<string, any>> {
    try {
      const [headerB64, payloadB64, signatureB64] = token.split(".");

      const expectedSignature = crypto
        .createHmac("sha256", this.secret)
        .update(`${headerB64}.${payloadB64}`)
        .digest("base64url");

      if (signatureB64 !== expectedSignature) {
        throw new Error("Invalid signature");
      }

      const payload = JSON.parse(
        Buffer.from(payloadB64, "base64url").toString()
      );

      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error("Token expired");
      }

      return payload;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}
