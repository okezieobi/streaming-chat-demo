import { Router, Request, Response, NextFunction } from 'express';

export const router = Router();
function dispatchResponse(scope: string) {
  return (req: Request, res: Response): void => {
    res.status(res.statusCode ?? 200).send({
      success: { ...res.locals[scope] },
    });
  };
}


