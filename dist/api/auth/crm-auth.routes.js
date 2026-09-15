"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const crm_auth_controller_1 = require("./crm-auth.controller");
const crm_auth_middleware_1 = require("./crm-auth.middleware");
const router = (0, express_1.Router)();
router.post("/login", (0, validation_middleware_1.validationMiddleware)({
    body: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required(),
    }),
}), crm_auth_controller_1.loginCrmUser);
router.get("/me", crm_auth_middleware_1.protectCrm, crm_auth_controller_1.getCurrentCrmUser);
router.post("/logout", crm_auth_middleware_1.protectCrm, crm_auth_controller_1.logoutCrmUser);
router.post("/change-password", crm_auth_middleware_1.protectCrm, (0, validation_middleware_1.validationMiddleware)({
    body: joi_1.default.object({
        currentPassword: joi_1.default.string().required(),
        newPassword: joi_1.default.string().min(6).required(),
        confirmPassword: joi_1.default.string().required().valid(joi_1.default.ref("newPassword")).messages({
            "any.only": "Confirm password must match new password",
        }),
    }),
}), crm_auth_controller_1.changePasswordCrmUser);
exports.default = router;
//# sourceMappingURL=crm-auth.routes.js.map