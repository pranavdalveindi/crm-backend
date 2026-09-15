import { Request, Response } from "express";
import { sendSuccess, sendError } from "../../../utils/response";
import * as rulesService from "./rules.service";
import { CRMUserRole } from "../../../database/entities/CRMUser";

// ── GET /crm/rules ────────────────────────────────────────────────────────────
export const listRules = async (_req: Request, res: Response) => {
  const rules = await rulesService.getAllRules();
  return sendSuccess(res, rules, "Rules fetched");
};

// ── GET /crm/rules/:id ────────────────────────────────────────────────────────
export const getRule = async (req: Request, res: Response) => {
  const rule = await rulesService.getRuleById(req.params.id);
  if (!rule) return sendError(res, "Rule not found", 404);
  return sendSuccess(res, rule, "Rule fetched");
};

// ── POST /crm/rules ───────────────────────────────────────────────────────────
export const createRule = async (req: Request, res: Response) => {
  if (req.crmUser!.role !== CRMUserRole.DEVELOPER) {
    return sendError(res, "Only developers can create rules", 403);
  }
  const rule = await rulesService.createRule(req.body, req.crmUser!.id);
  return sendSuccess(res, rule, "Rule created", 201);
};

// ── PUT /crm/rules/:id ────────────────────────────────────────────────────────
export const updateRule = async (req: Request, res: Response) => {
  if (req.crmUser!.role !== CRMUserRole.DEVELOPER) {
    return sendError(res, "Only developers can edit rules", 403);
  }
  const existing = await rulesService.getRuleById(req.params.id);
  if (!existing) return sendError(res, "Rule not found", 404);

  const updated = await rulesService.updateRule(req.params.id, req.body);
  return sendSuccess(res, updated, "Rule updated");
};

// ── DELETE /crm/rules/:id ─────────────────────────────────────────────────────
export const deleteRule = async (req: Request, res: Response) => {
  if (req.crmUser!.role !== CRMUserRole.DEVELOPER) {
    return sendError(res, "Only developers can delete rules", 403);
  }
  const existing = await rulesService.getRuleById(req.params.id);
  if (!existing) return sendError(res, "Rule not found", 404);

  await rulesService.deleteRule(req.params.id);
  return sendSuccess(res, null, "Rule deleted");
};

// ── PATCH /crm/rules/:id/toggle ──────────────────────────────────────────────
export const toggleRule = async (req: Request, res: Response) => {
  if (req.crmUser!.role !== CRMUserRole.DEVELOPER) {
    return sendError(res, "Only developers can toggle rules", 403);
  }
  const existing = await rulesService.getRuleById(req.params.id);
  if (!existing) return sendError(res, "Rule not found", 404);

  const { isActive } = req.body as { isActive: boolean };
  const updated = await rulesService.toggleRule(req.params.id, isActive);
  return sendSuccess(res, updated, `Rule ${isActive ? "activated" : "deactivated"}`);
};

// ── GET /crm/rules/:id/preview ────────────────────────────────────────────────
// Runs the rule against live data and shows which households would be selected.
// Developer only — used before activating a rule.
export const previewRule = async (req: Request, res: Response) => {
  if (req.crmUser!.role !== CRMUserRole.DEVELOPER) {
    return sendError(res, "Only developers can preview rules", 403);
  }
  const result = await rulesService.previewRule(req.params.id);
  if (!result) return sendError(res, "Rule not found", 404);
  return sendSuccess(res, result, "Rule preview generated");
};