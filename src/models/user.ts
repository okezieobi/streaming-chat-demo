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
  insert: sql("users/insert"),
  selectUnique: sql("users/auth"),
  selectByPk: sql("users/selectByPk"),
  selectByUnique: sql("users/selectByUnique"),
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
    this.authByPk = this.authByPk.bind(this);
    this.selectByUnique = this.selectByUnique.bind(this);
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
    if (uniqueUser == null || !uniqueUser.password) {
      const error = new Error("Invalid login details");
      error.name = "AuthError";
      throw error;
    }
    return uniqueUser.id;
  }

  async authByPk(id?: string) {
    const authUser = await this.db.client.oneOrNone<AuthUser>(
      queries.selectByPk,
      { id }
    );
    if (authUser == null) {
      const error = new Error("Authentication failed");
      error.name = "AuthError";
      throw error;
    }
    return authUser;
  }

  async selectByUnique(email?: string) {
    const authUser = await this.db.client.oneOrNone<AuthUser>(
      queries.selectByUnique,
      { email }
    );
    if (authUser == null) {
      const error = new Error("No user found");
      error.name = "NotFound";
      throw error;
    }
    return authUser;
  }
}
