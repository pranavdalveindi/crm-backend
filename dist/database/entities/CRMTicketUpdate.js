"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRMTicketUpdate = exports.CRMTicketUpdateType = void 0;
const typeorm_1 = require("typeorm");
const CRMUser_1 = require("./CRMUser");
const CRMTicket_1 = require("./CRMTicket");
var CRMTicketUpdateType;
(function (CRMTicketUpdateType) {
    CRMTicketUpdateType["STATUS_CHANGE"] = "STATUS_CHANGE";
    CRMTicketUpdateType["COMMENT"] = "COMMENT";
    CRMTicketUpdateType["ASSIGNMENT"] = "ASSIGNMENT";
})(CRMTicketUpdateType || (exports.CRMTicketUpdateType = CRMTicketUpdateType = {}));
let CRMTicketUpdate = class CRMTicketUpdate {
};
exports.CRMTicketUpdate = CRMTicketUpdate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CRMTicketUpdate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "ticket_id", type: "uuid" }),
    __metadata("design:type", String)
], CRMTicketUpdate.prototype, "ticketId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CRMTicket_1.CRMTicket, (ticket) => ticket.updates, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "ticket_id" }),
    __metadata("design:type", CRMTicket_1.CRMTicket)
], CRMTicketUpdate.prototype, "ticket", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "updated_by", type: "uuid" }),
    __metadata("design:type", String)
], CRMTicketUpdate.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CRMUser_1.CRMUser, { onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "updated_by" }),
    __metadata("design:type", CRMUser_1.CRMUser)
], CRMTicketUpdate.prototype, "updatedByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "update_type", type: "varchar", length: 20 }),
    __metadata("design:type", String)
], CRMTicketUpdate.prototype, "updateType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "old_status", type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", Object)
], CRMTicketUpdate.prototype, "oldStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "new_status", type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", Object)
], CRMTicketUpdate.prototype, "newStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], CRMTicketUpdate.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CRMTicketUpdate.prototype, "createdAt", void 0);
exports.CRMTicketUpdate = CRMTicketUpdate = __decorate([
    (0, typeorm_1.Entity)({ name: "crm_ticket_updates" })
], CRMTicketUpdate);
//# sourceMappingURL=CRMTicketUpdate.js.map