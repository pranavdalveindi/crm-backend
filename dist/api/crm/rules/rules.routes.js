"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const validation_middleware_1 = require("../../../middleware/validation.middleware");
const crm_auth_middleware_1 = require("../../auth/crm-auth.middleware");
const rules_controller_1 = require("./rules.controller");
const router = (0, express_1.Router)();
// All CRM routes require authentication
router.use(crm_auth_middleware_1.protectCrm);
const ruleBodySchema = joi_1.default.object({
    name: joi_1.default.string().max(255).required(),
    description: joi_1.default.string().allow("", null).optional(),
    eventType: joi_1.default.number().integer().required(),
    condition: joi_1.default.object().required(),
    lookbackDays: joi_1.default.number().integer().min(1).max(30).required(),
    priority: joi_1.default.string().valid("HIGH", "MEDIUM", "LOW").required(),
});
const updateRuleSchema = joi_1.default.object({
    name: joi_1.default.string().max(255).optional(),
    description: joi_1.default.string().allow("", null).optional(),
    eventType: joi_1.default.number().integer().optional(),
    condition: joi_1.default.object().optional(),
    lookbackDays: joi_1.default.number().integer().min(1).max(30).optional(),
    priority: joi_1.default.string().valid("HIGH", "MEDIUM", "LOW").optional(),
    isActive: joi_1.default.boolean().optional(),
});
router.get("/", rules_controller_1.listRules);
router.get("/:id", rules_controller_1.getRule);
router.get("/:id/preview", rules_controller_1.previewRule);
router.post("/", (0, validation_middleware_1.validationMiddleware)({ body: ruleBodySchema }), rules_controller_1.createRule);
router.put("/:id", (0, validation_middleware_1.validationMiddleware)({ body: updateRuleSchema }), rules_controller_1.updateRule);
router.patch("/:id/toggle", (0, validation_middleware_1.validationMiddleware)({ body: joi_1.default.object({ isActive: joi_1.default.boolean().required() }) }), rules_controller_1.toggleRule);
router.delete("/:id", rules_controller_1.deleteRule);
exports.default = router;
//# sourceMappingURL=rules.routes.js.map