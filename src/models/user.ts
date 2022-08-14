import {
  IsEmail,
  validateOrReject,
  IsString,
  IsNotEmpty,
} from "class-validator";

import { Database, BaseType, sql } from "./db";

export interface AuthUser extends BaseType {
  email: string;
}

export interface UserInput {
  email?: string;
  password?: string;
}

export type UniqueUser = Pick<BaseType, "id"> & { password: boolean };

const queries = {
  insert: sql("user/insert"),
  selectUnique: sql("user/authUnique"),
  selectByPk: sql("user/selectByPk"),
};

export class UserModel {
  @IsEmail()
  private email?: string;

  @IsString()
  @IsNotEmpty()
  private password?: string;

  constructor(private db: Database) {
    this.insert = this.insert.bind(this);
    this.authUnique = this.authUnique.bind(this);
    this.selectByPk = this.selectByPk.bind(this);
  }

  async validate(user: UserInput) {
    this.email = user.email;
    this.password = user.password;
    return validateOrReject(this, {
      validationError: { target: false },
    }).catch(this.db.validationErrHandler);
  }

  async insert(user: UserInput) {
    await this.validate(user);
    return this.db.client
      .none(queries.insert, user)
      .catch(this.db.queryErrHandler);
  }

  async authUnique(user: UserInput) {
    await this.validate(user);
    const uniqueUser = await this.db.client.oneOrNone<UniqueUser>(
      queries.selectUnique,
      user
    );
    if (uniqueUser == null || !uniqueUser.password)
      throw { name: "AuthError", message: "Invalid login details" };
    return uniqueUser.id;
  }

  async selectByPk(id: string) {
    const authUser = await this.db.client.oneOrNone<AuthUser>(
      queries.selectByPk,
      { id }
    );
    if (authUser == null)
      throw { name: "AuthError", message: "Authentication failed" };
    return authUser;
  }
}
