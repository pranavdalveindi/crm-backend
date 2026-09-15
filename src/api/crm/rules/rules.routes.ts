import { Router } from "express";
import Joi from "joi";
import { validationMiddleware } from "../../../middleware/validation.middleware";
import { protectCrm } from "../../auth/crm-auth.middleware";
import {
  listRules, getRule, createRule,
  updateRule, deleteRule, toggleRule, previewRule,
} from "./rules.controller";

const router = Router();

// All CRM routes require authentication
router.use(protectCrm);

const ruleBodySchema = Joi.object({
  name:         Joi.string().max(255).required(),
  description:  Joi.string().allow("", null).optional(),
  eventType:    Joi.number().integer().required(),
  condition:    Joi.object().required(),
  lookbackDays: Joi.number().integer().min(1).max(30).required(),
  priority:     Joi.string().valid("HIGH", "MEDIUM", "LOW").required(),
});

const updateRuleSchema = Joi.object({
  name:         Joi.string().max(255).optional(),
  description:  Joi.string().allow("", null).optional(),
  eventType:    Joi.number().integer().optional(),
  condition:    Joi.object().optional(),
  lookbackDays: Joi.number().integer().min(1).max(30).optional(),
  priority:     Joi.string().valid("HIGH", "MEDIUM", "LOW").optional(),
  isActive:     Joi.boolean().optional(),
});

router.get(  "/",              listRules);
router.get(  "/:id",           getRule);
router.get(  "/:id/preview",   previewRule);
router.post( "/",              validationMiddleware({ body: ruleBodySchema }), createRule);
router.put(  "/:id",           validationMiddleware({ body: updateRuleSchema }), updateRule);
router.patch("/:id/toggle",    validationMiddleware({ body: Joi.object({ isActive: Joi.boolean().required() }) }), toggleRule);
router.delete("/:id",          deleteRule);

export default router;