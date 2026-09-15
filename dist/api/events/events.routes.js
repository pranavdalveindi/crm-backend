"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const crm_auth_middleware_1 = require("../auth/crm-auth.middleware");
const events_controller_1 = require("./events.controller");
const router = (0, express_1.Router)();
router.get("/", crm_auth_middleware_1.protectCrm, (0, validation_middleware_1.validationMiddleware)({
    query: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
    }),
}), events_controller_1.listEvents);
exports.default = router;
//# sourceMappingURL=events.routes.js.map