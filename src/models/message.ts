import { validateOrReject, IsOptional, IsEmail } from "class-validator";

import { Database, BaseType, sql, QueryByUser, UserScope } from "./db";

export interface MessageInput extends UserScope {
  content?: string;
}

export type Message = Required<MessageInput & BaseType>;

const queries = {};

export class MessageModel {
  @IsEmail()
  private from?: string;

  @IsEmail()
  @IsOptional()
  private to?: string;

  private content?: string;

  constructor(private db: Database) {}

  async validate(message: MessageInput) {
    this.from = message.from;
    this.to = message.to;
    this.content = message.content;
    return validateOrReject(this, {
      validationError: { target: false },
    }).catch(this.db.validationErrHandler);
  }
}
