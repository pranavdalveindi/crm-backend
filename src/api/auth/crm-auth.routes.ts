import { Router } from "express";
import Joi from "joi";
import { validationMiddleware } from "../../middleware/validation.middleware";
import { getCurrentCrmUser, loginCrmUser, logoutCrmUser } from "./crm-auth.controller";
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

export default router;
