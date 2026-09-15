import { Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { AppDataSource } from "../../database/connection";
import { CRMUser } from "../../database/entities/CRMUser";
import { comparePassword } from "../../utils/encryption";
import { sendError, sendSuccess } from "../../utils/response";
import { CRM_ACCESS_COOKIE } from "./crm-auth.middleware";

const publicUser = (user: CRMUser) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  isActive: user.isActive,
});

export const loginCrmUser = async (req: Request, res: Response) => {
  if (!env.crm.jwtSecret) {
    return sendError(res, "CRM_JWT_SECRET is not configured", 500);
  }

  const { email, password } = req.body as { email: string; password: string };
  const user = await AppDataSource.getRepository(CRMUser).findOneBy({ email });

  if (!user || !user.isActive || !(await comparePassword(password, user.password))) {
    return sendError(res, "Invalid email or password", 401);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, portal: "crm" },
    env.crm.jwtSecret,
    { expiresIn: "1h" } as SignOptions
  );
  const isProduction = env.nodeEnv === "production";

  res.cookie(CRM_ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    signed: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
  });

  return sendSuccess(res, { user: publicUser(user) }, "Logged in");
};

export const getCurrentCrmUser = (req: Request, res: Response) => {
  return sendSuccess(res, { user: publicUser(req.crmUser!) }, "Current CRM user");
};

export const logoutCrmUser = (_req: Request, res: Response) => {
  res.clearCookie(CRM_ACCESS_COOKIE, { httpOnly: true, signed: true, sameSite: "lax" });
  return sendSuccess(res, null, "Logged out");
};
