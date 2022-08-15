import { Router, Request, Response, NextFunction } from "express";

import { Database, UserModel, TipModel, QueryByUser } from "../models";
import { AuthServices, Jwt } from "../services";

export const router = Router();
function dispatchResponse(scope: string) {
  return (req: Request, res: Response): void => {
    res.status(res.statusCode ?? 200).send({
      success: { ...res.locals[scope] },
    });
  };
}
const authScope = "auth";
const authRouter = Router();
authRouter.post(
  "/signup",
  async ({ body }: Request, res: Response, next: NextFunction) => {
    const database = new Database();
    const { insert } = new UserModel(database);
    await insert(body).catch(next);
    res.locals[authScope] = { message: "User signup successful" };
    res.status(201);
    next();
  }
);
authRouter.post(
  "/login",
  async ({ body }: Request, res: Response, next: NextFunction) => {
    const database = new Database();
    const jwt = new Jwt();
    const userModel = new UserModel(database);
    const { login } = new AuthServices(userModel, jwt);
    res.locals[authScope] = await login(body).catch(next);
    next();
  }
);

router.use(`/${authScope}`, authRouter, dispatchResponse(authScope));

router.use(async function authenticate(
  { headers: { token } }: Request,
  res: Response,
  next: NextFunction
) {
  const database = new Database();
  const jwt = new Jwt();
  const userModel = new UserModel(database);
  const { auth } = new AuthServices(userModel, jwt);
  res.locals = (await auth(token).catch(next)) as {
    authorized: unknown;
  };
  next();
});

async function findUser(
  { body: { to } }: Request,
  res: Response,
  next: NextFunction
) {
  const database = new Database();
  const { selectByUnique } = new UserModel(database);
  res.locals.user = await selectByUnique(to).catch(next);
  next();
}

const tipScope = "tips";
const tipesRouter = Router();
tipesRouter
  .route("/")
  .post(
    findUser,
    async (
      { body: { amount } }: Request,
      res: Response,
      next: NextFunction
    ) => {
      const database = new Database();
      const { insert } = new TipModel(database);
      const data = await insert({
        amount,
        to: res.locals.user.email,
        from: res.locals.authorized.email,
      }).catch(next);
      res.locals[tipScope] = { message: "Tip successfully sent", data };
      next();
    }
  )
  .get(
    async (
      { query: { page, size } }: Request,
      res: Response,
      next: NextFunction
    ) => {
      const database = new Database();
      const { select } = new TipModel(database);
      const tipeQuery: QueryByUser = {
        page: parseInt(`${page ?? 0}`, 10),
        size: parseInt(`${size ?? 1}`, 10),
        email: res.locals.authorized.email,
      };
      const data = await select(tipeQuery).catch(next);
      res.locals[tipScope] = { message: "Tips successfully retrieved", data };
      next();
    }
  );

router.use(`/${tipScope}`, tipesRouter, dispatchResponse(tipScope));
