import { CRMUser } from "../database/entities/CRMUser";

declare global {
  namespace Express {
    interface Request {
      crmUser?: CRMUser;
    }
  }
}

export {};
