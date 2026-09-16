import { Request, Response } from "express";
import { sendSuccess, sendError } from "../../../utils/response";
import * as svc from "./call-list.service";
import { CRMUserRole } from "../../../database/entities/CRMUser";

export const generate = async (req: Request, res: Response) => {
  if (![CRMUserRole.DEVELOPER, CRMUserRole.PANEL_MANAGER].includes(req.crmUser!.role)) {
    return sendError(res, "Unauthorized", 403);
  }
  const result = await svc.generateCallList();
  return sendSuccess(res, result, result.message);
};

export const getToday = async (req: Request, res: Response) => {
  const list = await svc.getTodayList(req.crmUser!.id, req.crmUser!.role);
  return sendSuccess(res, { households: list, date: new Date().toISOString().split("T")[0] }, "Call list fetched");
};

export const lock = async (req: Request, res: Response) => {
  const entry = await svc.lockEntry(req.params.id, req.crmUser!.id);
  if (!entry) return sendError(res, "Entry not found or not assigned to you", 404);
  return sendSuccess(res, entry, "Household locked");
};

export const updateStatus = async (req: Request, res: Response) => {
  const entry = await svc.updateStatus(req.params.id, req.crmUser!.id, req.body);
  if (!entry) return sendError(res, "Entry not found", 404);
  return sendSuccess(res, entry, "Status updated");
};

export const summary = async (req: Request, res: Response) => {
  if (req.crmUser!.role === CRMUserRole.CALL_AGENT) return sendError(res, "Unauthorized", 403);
  const data = await svc.getSummary();
  return sendSuccess(res, data, "Summary fetched");
};