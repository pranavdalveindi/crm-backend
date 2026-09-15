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
exports.CRMCallLog = exports.CRMCallOutcome = void 0;
const typeorm_1 = require("typeorm");
const CRMUser_1 = require("./CRMUser");
const CRMCallList_1 = require("./CRMCallList");
const Household_1 = require("./Household");
var CRMCallOutcome;
(function (CRMCallOutcome) {
    CRMCallOutcome["RESOLVED"] = "RESOLVED";
    CRMCallOutcome["ESCALATED"] = "ESCALATED";
    CRMCallOutcome["NO_ANSWER"] = "NO_ANSWER";
    CRMCallOutcome["CALLBACK"] = "CALLBACK";
})(CRMCallOutcome || (exports.CRMCallOutcome = CRMCallOutcome = {}));
let CRMCallLog = class CRMCallLog {
};
exports.CRMCallLog = CRMCallLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CRMCallLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "call_list_id", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], CRMCallLog.prototype, "callListId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CRMCallList_1.CRMCallList, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "call_list_id" }),
    __metadata("design:type", CRMCallList_1.CRMCallList)
], CRMCallLog.prototype, "callListEntry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "agent_id", type: "uuid" }),
    __metadata("design:type", String)
], CRMCallLog.prototype, "agentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CRMUser_1.CRMUser, { onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "agent_id" }),
    __metadata("design:type", CRMUser_1.CRMUser)
], CRMCallLog.prototype, "agent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "device_id", type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", Object)
], CRMCallLog.prototype, "deviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "household_id", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], CRMCallLog.prototype, "householdId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Household_1.Household, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "household_id" }),
    __metadata("design:type", Household_1.Household)
], CRMCallLog.prototype, "household", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "called_at", type: "timestamptz", nullable: true }),
    __metadata("design:type", Object)
], CRMCallLog.prototype, "calledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "duration_seconds", type: "integer", nullable: true }),
    __metadata("design:type", Object)
], CRMCallLog.prototype, "durationSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "twilio_call_sid", type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", Object)
], CRMCallLog.prototype, "twilioCallSid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "twilio_status", type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", Object)
], CRMCallLog.prototype, "twilioStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "recording_s3_url", type: "text", nullable: true }),
    __metadata("design:type", Object)
], CRMCallLog.prototype, "recordingS3Url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", Object)
], CRMCallLog.prototype, "outcome", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "issue_tags", type: "text", array: true, nullable: true }),
    __metadata("design:type", Object)
], CRMCallLog.prototype, "issueTags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], CRMCallLog.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "escalated_to", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], CRMCallLog.prototype, "escalatedTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CRMUser_1.CRMUser, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "escalated_to" }),
    __metadata("design:type", CRMUser_1.CRMUser)
], CRMCallLog.prototype, "escalatedToUser", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CRMCallLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CRMCallLog.prototype, "updatedAt", void 0);
exports.CRMCallLog = CRMCallLog = __decorate([
    (0, typeorm_1.Entity)({ name: "crm_call_logs" })
], CRMCallLog);
//# sourceMappingURL=CRMCallLog.js.map