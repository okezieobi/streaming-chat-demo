import express, {
  json,
  urlencoded,
  Request,
  Response,
  NextFunction,
} from "express";
import logger from "morgan";
import cors from "cors";

import { router } from "./router";
import swaggerSpec from "./swagger";

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use("/api-docs", swaggerSpec.serve, swaggerSpec.setup);

app.use("/api/v1", router);

const errHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const codes = new Map();
  codes.set("ValidationError", 400);
  codes.set("NotFound", 404);
  codes.set("Query", 409);
  codes.set("AuthError", 401);
  codes.set("JsonWebTokenError", 401);
  res.status(codes.get(err.name));
  if (res.statusCode > 399 || res.statusCode < 500) {
    res.send({ error: { ...err, message: err.message } });
  } else next(err);
};

app.use(errHandler);

export default app;
