"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crm_auth_middleware_1 = require("../../auth/crm-auth.middleware");
const call_list_controller_1 = require("./call-list.controller");
const router = (0, express_1.Router)();
router.use(crm_auth_middleware_1.protectCrm);
router.post("/generate", call_list_controller_1.generate);
router.get("/today", call_list_controller_1.getToday);
router.get("/summary", call_list_controller_1.summary);
router.patch("/:id/lock", call_list_controller_1.lock);
router.patch("/:id/status", call_list_controller_1.updateStatus);
exports.default = router;
//# sourceMappingURL=call-list.routes.js.map