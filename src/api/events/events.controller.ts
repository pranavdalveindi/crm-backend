import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { EVENTS_PER_PAGE, EventsService } from "./events.service";

const eventsService = new EventsService();

export const listEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestedPage = Number(req.query.page ?? 1);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const { events, total } = await eventsService.list(page);

    return sendSuccess(
      res,
      { events },
      events.length ? "Events retrieved" : "No events found",
      200,
      {
        page,
        limit: EVENTS_PER_PAGE,
        total,
        totalPages: Math.ceil(total / EVENTS_PER_PAGE),
      }
    );
  } catch (error) {
    return next(error);
  }
};
