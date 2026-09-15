"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewRule = exports.toggleRule = exports.deleteRule = exports.updateRule = exports.createRule = exports.getRule = exports.listRules = void 0;
const response_1 = require("../../../utils/response");
const rulesService = __importStar(require("./rules.service"));
const CRMUser_1 = require("../../../database/entities/CRMUser");
// ── GET /crm/rules ────────────────────────────────────────────────────────────
const listRules = async (_req, res) => {
    const rules = await rulesService.getAllRules();
    return (0, response_1.sendSuccess)(res, rules, "Rules fetched");
};
exports.listRules = listRules;
// ── GET /crm/rules/:id ────────────────────────────────────────────────────────
const getRule = async (req, res) => {
    const rule = await rulesService.getRuleById(req.params.id);
    if (!rule)
        return (0, response_1.sendError)(res, "Rule not found", 404);
    return (0, response_1.sendSuccess)(res, rule, "Rule fetched");
};
exports.getRule = getRule;
// ── POST /crm/rules ───────────────────────────────────────────────────────────
const createRule = async (req, res) => {
    if (req.crmUser.role !== CRMUser_1.CRMUserRole.DEVELOPER) {
        return (0, response_1.sendError)(res, "Only developers can create rules", 403);
    }
    const rule = await rulesService.createRule(req.body, req.crmUser.id);
    return (0, response_1.sendSuccess)(res, rule, "Rule created", 201);
};
exports.createRule = createRule;
// ── PUT /crm/rules/:id ────────────────────────────────────────────────────────
const updateRule = async (req, res) => {
    if (req.crmUser.role !== CRMUser_1.CRMUserRole.DEVELOPER) {
        return (0, response_1.sendError)(res, "Only developers can edit rules", 403);
    }
    const existing = await rulesService.getRuleById(req.params.id);
    if (!existing)
        return (0, response_1.sendError)(res, "Rule not found", 404);
    const updated = await rulesService.updateRule(req.params.id, req.body);
    return (0, response_1.sendSuccess)(res, updated, "Rule updated");
};
exports.updateRule = updateRule;
// ── DELETE /crm/rules/:id ─────────────────────────────────────────────────────
const deleteRule = async (req, res) => {
    if (req.crmUser.role !== CRMUser_1.CRMUserRole.DEVELOPER) {
        return (0, response_1.sendError)(res, "Only developers can delete rules", 403);
    }
    const existing = await rulesService.getRuleById(req.params.id);
    if (!existing)
        return (0, response_1.sendError)(res, "Rule not found", 404);
    await rulesService.deleteRule(req.params.id);
    return (0, response_1.sendSuccess)(res, null, "Rule deleted");
};
exports.deleteRule = deleteRule;
// ── PATCH /crm/rules/:id/toggle ──────────────────────────────────────────────
const toggleRule = async (req, res) => {
    if (req.crmUser.role !== CRMUser_1.CRMUserRole.DEVELOPER) {
        return (0, response_1.sendError)(res, "Only developers can toggle rules", 403);
    }
    const existing = await rulesService.getRuleById(req.params.id);
    if (!existing)
        return (0, response_1.sendError)(res, "Rule not found", 404);
    const { isActive } = req.body;
    const updated = await rulesService.toggleRule(req.params.id, isActive);
    return (0, response_1.sendSuccess)(res, updated, `Rule ${isActive ? "activated" : "deactivated"}`);
};
exports.toggleRule = toggleRule;
// ── GET /crm/rules/:id/preview ────────────────────────────────────────────────
// Runs the rule against live data and shows which households would be selected.
// Developer only — used before activating a rule.
const previewRule = async (req, res) => {
    if (req.crmUser.role !== CRMUser_1.CRMUserRole.DEVELOPER) {
        return (0, response_1.sendError)(res, "Only developers can preview rules", 403);
    }
    const result = await rulesService.previewRule(req.params.id);
    if (!result)
        return (0, response_1.sendError)(res, "Rule not found", 404);
    return (0, response_1.sendSuccess)(res, result, "Rule preview generated");
};
exports.previewRule = previewRule;
//# sourceMappingURL=rules.controller.js.map