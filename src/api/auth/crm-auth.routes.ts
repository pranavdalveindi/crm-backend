import { Router } from "express";
import Joi from "joi";
import { validationMiddleware } from "../../middleware/validation.middleware";
import { getCurrentCrmUser, loginCrmUser, logoutCrmUser, changePasswordCrmUser } from "./crm-auth.controller";
import { protectCrm } from "./crm-auth.middleware";

const router = Router();

router.post(
  "/login",
  validationMiddleware({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  loginCrmUser
);
router.get("/me", protectCrm, getCurrentCrmUser);
router.post("/logout", protectCrm, logoutCrmUser);

router.post(
  "/change-password",
  protectCrm,
  validationMiddleware({
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).required(),
      confirmPassword: Joi.string().required().valid(Joi.ref("newPassword")).messages({
        "any.only": "Confirm password must match new password",
      }),
    }),
  }),
  changePasswordCrmUser
);

export default router;
