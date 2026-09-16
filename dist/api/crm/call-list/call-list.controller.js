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
exports.summary = exports.updateStatus = exports.lock = exports.getToday = exports.generate = void 0;
const response_1 = require("../../../utils/response");
const svc = __importStar(require("./call-list.service"));
const CRMUser_1 = require("../../../database/entities/CRMUser");
const generate = async (req, res) => {
    if (![CRMUser_1.CRMUserRole.DEVELOPER, CRMUser_1.CRMUserRole.PANEL_MANAGER].includes(req.crmUser.role)) {
        return (0, response_1.sendError)(res, "Unauthorized", 403);
    }
    const result = await svc.generateCallList();
    return (0, response_1.sendSuccess)(res, result, result.message);
};
exports.generate = generate;
const getToday = async (req, res) => {
    const list = await svc.getTodayList(req.crmUser.id, req.crmUser.role);
    return (0, response_1.sendSuccess)(res, { households: list, date: new Date().toISOString().split("T")[0] }, "Call list fetched");
};
exports.getToday = getToday;
const lock = async (req, res) => {
    const entry = await svc.lockEntry(req.params.id, req.crmUser.id);
    if (!entry)
        return (0, response_1.sendError)(res, "Entry not found or not assigned to you", 404);
    return (0, response_1.sendSuccess)(res, entry, "Household locked");
};
exports.lock = lock;
const updateStatus = async (req, res) => {
    const entry = await svc.updateStatus(req.params.id, req.crmUser.id, req.body);
    if (!entry)
        return (0, response_1.sendError)(res, "Entry not found", 404);
    return (0, response_1.sendSuccess)(res, entry, "Status updated");
};
exports.updateStatus = updateStatus;
const summary = async (req, res) => {
    if (req.crmUser.role === CRMUser_1.CRMUserRole.CALL_AGENT)
        return (0, response_1.sendError)(res, "Unauthorized", 403);
    const data = await svc.getSummary();
    return (0, response_1.sendSuccess)(res, data, "Summary fetched");
};
exports.summary = summary;
//# sourceMappingURL=call-list.controller.js.map