"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEvents = void 0;
const response_1 = require("../../utils/response");
const events_service_1 = require("./events.service");
const eventsService = new events_service_1.EventsService();
const listEvents = async (req, res, next) => {
    try {
        const requestedPage = Number(req.query.page ?? 1);
        const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
        const { events, total } = await eventsService.list(page);
        return (0, response_1.sendSuccess)(res, { events }, events.length ? "Events retrieved" : "No events found", 200, {
            page,
            limit: events_service_1.EVENTS_PER_PAGE,
            total,
            totalPages: Math.ceil(total / events_service_1.EVENTS_PER_PAGE),
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.listEvents = listEvents;
//# sourceMappingURL=events.controller.js.map