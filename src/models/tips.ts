import { IsCurrency, IsEmail, validateOrReject } from "class-validator";

import { Database, BaseType, sql } from "./db";

export interface TipInput {
  amount?: number;
  from?: string;
  to?: string;
}

export interface TipQuery {
  email?: string;
  page?: number;
  size?: number;
}

export type Tip = TipInput & BaseType;

const queries = {
  insert: sql("tips/insert"),
  select: sql("tips/selecr"),
};

export class TipModel {
  @IsEmail()
  private from?: string;

  @IsEmail()
  private to?: string;

  @IsCurrency()
  private amount?: number;

  constructor(private db: Database) {
    this.insert = this.insert.bind(this);
    this.select = this.select.bind(this);
  }

  async validate(tip: TipInput) {
    this.amount = tip.amount;
    this.from = tip.from;
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

  async select(query: TipQuery) {
    const tips = await this.db.client.manyOrNone<Tip>(queries.select, query);
    if (tips == null) throw { name: "NotFound", message: "No tips found" };
    return tips;
  }
}
