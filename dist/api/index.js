"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crm_auth_routes_1 = __importDefault(require("./auth/crm-auth.routes"));
const events_routes_1 = __importDefault(require("./events/events.routes"));
const rules_routes_1 = __importDefault(require("./crm/rules/rules.routes"));
const call_list_routes_1 = __importDefault(require("./crm/call-list/call-list.routes"));
const router = (0, express_1.Router)();
router.use("/auth", crm_auth_routes_1.default);
router.use("/events", events_routes_1.default);
router.use("/crm/rules", rules_routes_1.default);
router.use("/crm/call-list", call_list_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map