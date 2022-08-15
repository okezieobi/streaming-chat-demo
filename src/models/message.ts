import { validateOrReject, IsOptional, IsEmail } from "class-validator";

import { Database, BaseType, sql, QueryByUser, UserScope } from "./db";

export interface MessageInput extends UserScope {
  content?: string;
}

export type Message = Required<MessageInput & BaseType>;

const queries = {
  insert: sql("messages/insert"),
  select: sql("messages/select"),
  update: sql("messages/update"),
};

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

  async insert(message: MessageInput) {
    await this.validate(message);
    return this.db.client
      .one<Message>(queries.insert, message)
      .catch(this.db.queryErrHandler);
  }

  async select(query: QueryByUser) {
    return this.db.client.manyOrNone<Message>(queries.select, query);
  }

  async update(content: string, id: string, from: string) {
    const updatedMessage = await this.db.client.oneOrNone<Message>(
      queries.update,
      { content, id, from }
    );
    if (updatedMessage == null) {
      const error = new Error("No message found to be updated");
      error.name = "NotFound";
      throw error;
    }
    return updatedMessage;
  }
}
