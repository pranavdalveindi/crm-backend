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
exports.CRMUser = exports.CRMUserRole = void 0;
const typeorm_1 = require("typeorm");
var CRMUserRole;
(function (CRMUserRole) {
    CRMUserRole["PANEL_MANAGER"] = "panel_manager";
    CRMUserRole["CALL_AGENT"] = "call_agent";
    CRMUserRole["DEVELOPER"] = "developer";
})(CRMUserRole || (exports.CRMUserRole = CRMUserRole = {}));
/** CRM accounts are deliberately isolated from the Indirex `users` table. */
let CRMUser = class CRMUser {
};
exports.CRMUser = CRMUser;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CRMUser.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], CRMUser.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CRMUser.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CRMUser.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 30 }),
    __metadata("design:type", String)
], CRMUser.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CRMUser.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CRMUser.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CRMUser.prototype, "updatedAt", void 0);
exports.CRMUser = CRMUser = __decorate([
    (0, typeorm_1.Entity)({ name: "crm_users" })
], CRMUser);
//# sourceMappingURL=CRMUser.js.map