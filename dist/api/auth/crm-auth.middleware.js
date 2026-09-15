"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectCrm = exports.CRM_ACCESS_COOKIE = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const connection_1 = require("../../database/connection");
const CRMUser_1 = require("../../database/entities/CRMUser");
const response_1 = require("../../utils/response");
exports.CRM_ACCESS_COOKIE = "crm_access_token";
const protectCrm = async (req, res, next) => {
    const authorization = req.headers.authorization;
    const bearerToken = authorization?.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length)
        : undefined;
    const token = bearerToken ?? req.signedCookies?.[exports.CRM_ACCESS_COOKIE];
    if (!token || !env_1.env.crm.jwtSecret) {
        return (0, response_1.sendError)(res, "Not authorized", 401);
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.crm.jwtSecret);
        const user = await connection_1.AppDataSource.getRepository(CRMUser_1.CRMUser).findOneBy({ id: payload.id });
        if (!user || !user.isActive) {
            return (0, response_1.sendError)(res, "Not authorized", 401);
        }
        req.crmUser = user;
        return next();
    }
    catch {
        return (0, response_1.sendError)(res, "Invalid or expired token", 401);
    }
};
exports.protectCrm = protectCrm;
//# sourceMappingURL=crm-auth.middleware.js.map