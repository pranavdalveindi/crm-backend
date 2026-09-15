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
exports.CRMTicket = exports.CRMTicketPriority = exports.CRMTicketTeam = exports.CRMTicketStatus = void 0;
const typeorm_1 = require("typeorm");
const CRMUser_1 = require("./CRMUser");
const CRMCallLog_1 = require("./CRMCallLog");
const Household_1 = require("./Household");
const CRMTicketUpdate_1 = require("./CRMTicketUpdate");
var CRMTicketStatus;
(function (CRMTicketStatus) {
    CRMTicketStatus["OPEN"] = "OPEN";
    CRMTicketStatus["IN_PROGRESS"] = "IN_PROGRESS";
    CRMTicketStatus["RESOLVED"] = "RESOLVED";
    CRMTicketStatus["CLOSED"] = "CLOSED";
    CRMTicketStatus["REOPENED"] = "REOPENED";
})(CRMTicketStatus || (exports.CRMTicketStatus = CRMTicketStatus = {}));
var CRMTicketTeam;
(function (CRMTicketTeam) {
    CRMTicketTeam["TECHNICAL"] = "TECHNICAL";
    CRMTicketTeam["FIELD_TECHNICIAN"] = "FIELD_TECHNICIAN";
})(CRMTicketTeam || (exports.CRMTicketTeam = CRMTicketTeam = {}));
var CRMTicketPriority;
(function (CRMTicketPriority) {
    CRMTicketPriority["HIGH"] = "HIGH";
    CRMTicketPriority["MEDIUM"] = "MEDIUM";
    CRMTicketPriority["LOW"] = "LOW";
})(CRMTicketPriority || (exports.CRMTicketPriority = CRMTicketPriority = {}));
let CRMTicket = class CRMTicket {
};
exports.CRMTicket = CRMTicket;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CRMTicket.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "call_log_id", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], CRMTicket.prototype, "callLogId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CRMCallLog_1.CRMCallLog, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "call_log_id" }),
    __metadata("design:type", CRMCallLog_1.CRMCallLog)
], CRMTicket.prototype, "callLog", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "device_id", type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", Object)
], CRMTicket.prototype, "deviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "household_id", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], CRMTicket.prototype, "householdId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Household_1.Household, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "household_id" }),
    __metadata("design:type", Household_1.Household)
], CRMTicket.prototype, "household", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10, nullable: true }),
    __metadata("design:type", Object)
], CRMTicket.prototype, "hhid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "raised_by", type: "uuid" }),
    __metadata("design:type", String)
], CRMTicket.prototype, "raisedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CRMUser_1.CRMUser, { onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "raised_by" }),
    __metadata("design:type", CRMUser_1.CRMUser)
], CRMTicket.prototype, "raisedByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "raised_at", type: "timestamptz", default: () => "now()" }),
    __metadata("design:type", Date)
], CRMTicket.prototype, "raisedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "assigned_team", type: "varchar", length: 30 }),
    __metadata("design:type", String)
], CRMTicket.prototype, "assignedTeam", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "assigned_to", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], CRMTicket.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CRMUser_1.CRMUser, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "assigned_to" }),
    __metadata("design:type", CRMUser_1.CRMUser)
], CRMTicket.prototype, "assignedToUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "issue_tag", type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", Object)
], CRMTicket.prototype, "issueTag", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], CRMTicket.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], CRMTicket.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10, default: CRMTicketPriority.MEDIUM }),
    __metadata("design:type", String)
], CRMTicket.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: CRMTicketStatus.OPEN }),
    __metadata("design:type", String)
], CRMTicket.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "resolution_notes", type: "text", nullable: true }),
    __metadata("design:type", Object)
], CRMTicket.prototype, "resolutionNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "resolved_at", type: "timestamptz", nullable: true }),
    __metadata("design:type", Object)
], CRMTicket.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "closed_by", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], CRMTicket.prototype, "closedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CRMUser_1.CRMUser, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "closed_by" }),
    __metadata("design:type", CRMUser_1.CRMUser)
], CRMTicket.prototype, "closedByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "closed_at", type: "timestamptz", nullable: true }),
    __metadata("design:type", Object)
], CRMTicket.prototype, "closedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CRMTicketUpdate_1.CRMTicketUpdate, (update) => update.ticket),
    __metadata("design:type", Array)
], CRMTicket.prototype, "updates", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CRMTicket.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CRMTicket.prototype, "updatedAt", void 0);
exports.CRMTicket = CRMTicket = __decorate([
    (0, typeorm_1.Entity)({ name: "crm_tickets" })
], CRMTicket);
//# sourceMappingURL=CRMTicket.js.map