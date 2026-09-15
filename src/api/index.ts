import { Router } from "express";
import crmAuthRouter from "./auth/crm-auth.routes";
import eventsRouter from "./events/events.routes";
import rulesRouter from "./crm/rules/rules.routes";

const router = Router();

router.use("/auth", crmAuthRouter);
router.use("/events", eventsRouter);

router.use("/crm/rules", rulesRouter);

export default router;
