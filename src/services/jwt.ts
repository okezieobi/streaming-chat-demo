import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

interface AuthPayload {
  id: string;
}

const jwtSecret = process.env.JWT_SECRET ?? "";

export class Jwt {
  async generate(id?: string) {
    return jwt.sign(
      { id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 60 },
      jwtSecret
    );
  }

  async verify(token: string) {
    return jwt.verify(token, jwtSecret) as AuthPayload;
  }
}
