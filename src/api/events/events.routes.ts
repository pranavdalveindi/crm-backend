import { Router } from "express";
import Joi from "joi";
import { validationMiddleware } from "../../middleware/validation.middleware";
import { protectCrm } from "../auth/crm-auth.middleware";
import { listEvents } from "./events.controller";

const router = Router();

router.get(
  "/",
  protectCrm,
  validationMiddleware({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
    }),
  }),
  listEvents
);

export default router;
