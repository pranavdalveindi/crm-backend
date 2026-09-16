import { Router } from "express";
import crmAuthRouter from "./auth/crm-auth.routes";
import eventsRouter from "./events/events.routes";
import rulesRouter from "./crm/rules/rules.routes";
import callListRouter  from "./crm/call-list/call-list.routes";

const router = Router();

router.use("/auth", crmAuthRouter);
router.use("/events", eventsRouter);

router.use("/crm/rules", rulesRouter);

router.use("/crm/call-list",  callListRouter);

export default router;
