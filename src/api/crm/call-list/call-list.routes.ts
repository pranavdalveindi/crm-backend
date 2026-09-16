import { Router } from "express";
import { protectCrm } from "../../auth/crm-auth.middleware";
import { generate, getToday, lock, updateStatus, summary } from "./call-list.controller";

const router = Router();
router.use(protectCrm);

router.post  ("/generate",       generate);
router.get   ("/today",          getToday);
router.get   ("/summary",        summary);
router.patch ("/:id/lock",       lock);
router.patch ("/:id/status",     updateStatus);

export default router;