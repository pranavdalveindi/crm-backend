import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppDataSource } from "../../database/connection";
import { CRMUser } from "../../database/entities/CRMUser";
import { sendError } from "../../utils/response";

export const CRM_ACCESS_COOKIE = "crm_access_token";

export const protectCrm = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
  const token = bearerToken ?? req.signedCookies?.[CRM_ACCESS_COOKIE];

  if (!token || !env.crm.jwtSecret) {
    return sendError(res, "Not authorized", 401);
  }

  try {
    const payload = jwt.verify(token, env.crm.jwtSecret) as { id: string };
    const user = await AppDataSource.getRepository(CRMUser).findOneBy({ id: payload.id });

    if (!user || !user.isActive) {
      return sendError(res, "Not authorized", 401);
    }

    req.crmUser = user;
    return next();
  } catch {
    return sendError(res, "Invalid or expired token", 401);
  }
};
