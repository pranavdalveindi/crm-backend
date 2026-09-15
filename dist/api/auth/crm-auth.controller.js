"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordCrmUser = exports.logoutCrmUser = exports.getCurrentCrmUser = exports.loginCrmUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const connection_1 = require("../../database/connection");
const CRMUser_1 = require("../../database/entities/CRMUser");
const encryption_1 = require("../../utils/encryption");
const encryption_2 = require("../../utils/encryption");
const response_1 = require("../../utils/response");
const crm_auth_middleware_1 = require("./crm-auth.middleware");
const publicUser = (user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
});
const loginCrmUser = async (req, res) => {
    if (!env_1.env.crm.jwtSecret) {
        return (0, response_1.sendError)(res, "CRM_JWT_SECRET is not configured", 500);
    }
    const { email, password } = req.body;
    const user = await connection_1.AppDataSource.getRepository(CRMUser_1.CRMUser).findOneBy({ email });
    if (!user || !user.isActive || !(await (0, encryption_1.comparePassword)(password, user.password))) {
        return (0, response_1.sendError)(res, "Invalid email or password", 401);
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, portal: "crm" }, env_1.env.crm.jwtSecret, { expiresIn: "1h" });
    const isProduction = env_1.env.nodeEnv === "production";
    res.cookie(crm_auth_middleware_1.CRM_ACCESS_COOKIE, token, {
        httpOnly: true,
        secure: isProduction,
        signed: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
    });
    return (0, response_1.sendSuccess)(res, { user: publicUser(user) }, "Logged in");
};
exports.loginCrmUser = loginCrmUser;
const getCurrentCrmUser = (req, res) => {
    return (0, response_1.sendSuccess)(res, { user: publicUser(req.crmUser) }, "Current CRM user");
};
exports.getCurrentCrmUser = getCurrentCrmUser;
const logoutCrmUser = (_req, res) => {
    res.clearCookie(crm_auth_middleware_1.CRM_ACCESS_COOKIE, { httpOnly: true, signed: true, sameSite: "lax" });
    return (0, response_1.sendSuccess)(res, null, "Logged out");
};
exports.logoutCrmUser = logoutCrmUser;
const changePasswordCrmUser = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        return (0, response_1.sendError)(res, "New password and confirm password do not match", 400);
    }
    if (currentPassword === newPassword) {
        return (0, response_1.sendError)(res, "New password must be different from current password", 400);
    }
    const userRepo = connection_1.AppDataSource.getRepository(CRMUser_1.CRMUser);
    const user = await userRepo.findOneBy({ id: req.crmUser.id });
    if (!user || !user.isActive) {
        return (0, response_1.sendError)(res, "User not found or inactive", 404);
    }
    const isPasswordValid = await (0, encryption_1.comparePassword)(currentPassword, user.password);
    if (!isPasswordValid) {
        return (0, response_1.sendError)(res, "Incorrect current password", 400);
    }
    user.password = await (0, encryption_2.hashPassword)(newPassword);
    user.mustChangePassword = false;
    await userRepo.save(user);
    return (0, response_1.sendSuccess)(res, { user: publicUser(user) }, "Password changed successfully");
};
exports.changePasswordCrmUser = changePasswordCrmUser;
//# sourceMappingURL=crm-auth.controller.js.map