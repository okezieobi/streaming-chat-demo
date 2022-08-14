import { Jwt } from "./jwt";
import { UserModel, UserInput } from "../models";

export class AuthServices {
  constructor(private readonly model: UserModel, private readonly jwt: Jwt) {
    this.login = this.login.bind(this);
    this.auth = this.auth.bind(this);
  }

  async login(arg: UserInput): Promise<{ token?: string; message: string }> {
    const userId = await this.model.authUnique(arg);
    const token = await this.jwt.generate(userId);
    return { token: token, message: "User login successful" };
  }

  async auth(arg?: string | string[]) {
    const { id } = await this.jwt.verify(`${arg}`);
    const authorized = await this.model.authByPk(id);
    return { authorized };
  }
}
