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
exports.CRMCallList = exports.CRMCallListPriority = exports.CRMCallListStatus = void 0;
const typeorm_1 = require("typeorm");
const CRMUser_1 = require("./CRMUser");
const CRMRule_1 = require("./CRMRule");
const Household_1 = require("./Household");
var CRMCallListStatus;
(function (CRMCallListStatus) {
    CRMCallListStatus["PENDING"] = "PENDING";
    CRMCallListStatus["LOCKED"] = "LOCKED";
    CRMCallListStatus["ATTEMPTED"] = "ATTEMPTED";
    CRMCallListStatus["RESOLVED"] = "RESOLVED";
    CRMCallListStatus["ESCALATED"] = "ESCALATED";
})(CRMCallListStatus || (exports.CRMCallListStatus = CRMCallListStatus = {}));
var CRMCallListPriority;
(function (CRMCallListPriority) {
    CRMCallListPriority["HIGH"] = "HIGH";
    CRMCallListPriority["MEDIUM"] = "MEDIUM";
    CRMCallListPriority["LOW"] = "LOW";
})(CRMCallListPriority || (exports.CRMCallListPriority = CRMCallListPriority = {}));
let CRMCallList = class CRMCallList {
};
exports.CRMCallList = CRMCallList;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CRMCallList.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "generated_at", type: "date", default: () => "CURRENT_DATE" }),
    __metadata("design:type", String)
], CRMCallList.prototype, "generatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "device_id", type: "varchar", length: 50 }),
    __metadata("design:type", String)
], CRMCallList.prototype, "deviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "household_id", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], CRMCallList.prototype, "householdId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Household_1.Household, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "household_id" }),
    __metadata("design:type", Household_1.Household)
], CRMCallList.prototype, "household", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10, nullable: true }),
    __metadata("design:type", Object)
], CRMCallList.prototype, "hhid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "rule_id", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], CRMCallList.prototype, "ruleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CRMRule_1.CRMRule, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "rule_id" }),
    __metadata("design:type", CRMRule_1.CRMRule)
], CRMCallList.prototype, "rule", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "rule_name", type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", Object)
], CRMCallList.prototype, "ruleName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10, default: CRMCallListPriority.MEDIUM }),
    __metadata("design:type", String)
], CRMCallList.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], CRMCallList.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "days_affected", type: "integer", nullable: true }),
    __metadata("design:type", Object)
], CRMCallList.prototype, "daysAffected", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "assigned_to", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], CRMCallList.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CRMUser_1.CRMUser, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "assigned_to" }),
    __metadata("design:type", CRMUser_1.CRMUser)
], CRMCallList.prototype, "agent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: CRMCallListStatus.PENDING }),
    __metadata("design:type", String)
], CRMCallList.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "locked_at", type: "timestamptz", nullable: true }),
    __metadata("design:type", Object)
], CRMCallList.prototype, "lockedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CRMCallList.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CRMCallList.prototype, "updatedAt", void 0);
exports.CRMCallList = CRMCallList = __decorate([
    (0, typeorm_1.Entity)({ name: "crm_call_list" })
], CRMCallList);
//# sourceMappingURL=CRMCallList.js.map