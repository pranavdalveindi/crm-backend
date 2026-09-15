import { Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { AppDataSource } from "../../database/connection";
import { CRMUser } from "../../database/entities/CRMUser";
import { comparePassword } from "../../utils/encryption";
import { hashPassword } from "../../utils/encryption";
import { sendError, sendSuccess } from "../../utils/response";
import { CRM_ACCESS_COOKIE } from "./crm-auth.middleware";

const publicUser = (user: CRMUser) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  isActive: user.isActive,
  mustChangePassword: user.mustChangePassword,
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

export const changePasswordCrmUser = async (req: Request, res: Response) => {
  const { currentPassword, newPassword, confirmPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };

  if (newPassword !== confirmPassword) {
    return sendError(res, "New password and confirm password do not match", 400);
  }

  if (currentPassword === newPassword) {
    return sendError(res, "New password must be different from current password", 400);
  }

  const userRepo = AppDataSource.getRepository(CRMUser);
  const user = await userRepo.findOneBy({ id: req.crmUser!.id });

  if (!user || !user.isActive) {
    return sendError(res, "User not found or inactive", 404);
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isPasswordValid) {
    return sendError(res, "Incorrect current password", 400);
  }

  user.password = await hashPassword(newPassword);
  user.mustChangePassword = false;
  await userRepo.save(user);

  return sendSuccess(res, { user: publicUser(user) }, "Password changed successfully");
};
