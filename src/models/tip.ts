import { IsCurrency, IsEmail, validateOrReject } from "class-validator";

import { Database, BaseType, sql, QueryByUser, UserScope } from "./db";

export interface TipInput extends UserScope {
  amount?: string;
}

export type Tip = Required<TipInput & BaseType>;

const queries = {
  insert: sql("tips/insert"),
  select: sql("tips/select"),
};

export class TipModel {
  @IsEmail()
  private from?: string;

  @IsEmail()
  private to?: string;

  @IsCurrency()
  private amount?: string;

  constructor(private db: Database) {
    this.insert = this.insert.bind(this);
    this.select = this.select.bind(this);
  }

  async validate(tip: TipInput) {
    this.amount = tip.amount;
    this.from = tip.from;
    this.to = tip.to;
    return validateOrReject(this, {
      validationError: { target: false },
    }).catch(this.db.validationErrHandler);
  }

  async insert(tip: TipInput) {
    await this.validate(tip);
    return this.db.client
      .one<Tip>(queries.insert, tip)
      .catch(this.db.queryErrHandler);
  }

  async select(query: QueryByUser) {
    return this.db.client.manyOrNone<Tip>(queries.select, query);
  }
}
