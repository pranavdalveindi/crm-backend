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
exports.CRMRule = exports.CRMRulePriority = void 0;
const typeorm_1 = require("typeorm");
const CRMUser_1 = require("./CRMUser");
var CRMRulePriority;
(function (CRMRulePriority) {
    CRMRulePriority["HIGH"] = "HIGH";
    CRMRulePriority["MEDIUM"] = "MEDIUM";
    CRMRulePriority["LOW"] = "LOW";
})(CRMRulePriority || (exports.CRMRulePriority = CRMRulePriority = {}));
let CRMRule = class CRMRule {
};
exports.CRMRule = CRMRule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CRMRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], CRMRule.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], CRMRule.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "event_type", type: "integer" }),
    __metadata("design:type", Number)
], CRMRule.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", default: {} }),
    __metadata("design:type", Object)
], CRMRule.prototype, "condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "lookback_days", type: "integer", default: 4 }),
    __metadata("design:type", Number)
], CRMRule.prototype, "lookbackDays", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        length: 10,
        default: CRMRulePriority.MEDIUM,
    }),
    __metadata("design:type", String)
], CRMRule.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], CRMRule.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_by", type: "uuid" }),
    __metadata("design:type", String)
], CRMRule.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CRMUser_1.CRMUser, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "created_by" }),
    __metadata("design:type", CRMUser_1.CRMUser)
], CRMRule.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CRMRule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CRMRule.prototype, "updatedAt", void 0);
exports.CRMRule = CRMRule = __decorate([
    (0, typeorm_1.Entity)({ name: "crm_rules" })
], CRMRule);
//# sourceMappingURL=CRMRule.js.map