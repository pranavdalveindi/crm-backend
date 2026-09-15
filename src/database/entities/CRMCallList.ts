import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from "typeorm";
import { CRMUser } from "./CRMUser";
import { CRMRule } from "./CRMRule";
import { Household } from "./Household";

export enum CRMCallListStatus {
  PENDING   = "PENDING",
  LOCKED    = "LOCKED",
  ATTEMPTED = "ATTEMPTED",
  RESOLVED  = "RESOLVED",
  ESCALATED = "ESCALATED",
}

export enum CRMCallListPriority {
  HIGH   = "HIGH",
  MEDIUM = "MEDIUM",
  LOW    = "LOW",
}

@Entity({ name: "crm_call_list" })
export class CRMCallList {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "generated_at", type: "date", default: () => "CURRENT_DATE" })
  generatedAt!: string;

  @Column({ name: "device_id", type: "varchar", length: 50 })
  deviceId!: string;

  @Column({ name: "household_id", type: "uuid", nullable: true })
  householdId?: string | null;

  @ManyToOne(() => Household, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "household_id" })
  household?: Household;

  @Column({ type: "varchar", length: 10, nullable: true })
  hhid?: string | null;

  @Column({ name: "rule_id", type: "uuid", nullable: true })
  ruleId?: string | null;

  @ManyToOne(() => CRMRule, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "rule_id" })
  rule?: CRMRule;

  // Snapshot of rule name at generation time (rule may change later)
  @Column({ name: "rule_name", type: "varchar", length: 255, nullable: true })
  ruleName?: string | null;

  @Column({ type: "varchar", length: 10, default: CRMCallListPriority.MEDIUM })
  priority!: CRMCallListPriority;

  @Column({ type: "text", nullable: true })
  reason?: string | null;

  @Column({ name: "days_affected", type: "integer", nullable: true })
  daysAffected?: number | null;

  @Column({ name: "assigned_to", type: "uuid", nullable: true })
  assignedTo?: string | null;

  @ManyToOne(() => CRMUser, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "assigned_to" })
  agent?: CRMUser;

  @Column({ type: "varchar", length: 20, default: CRMCallListStatus.PENDING })
  status!: CRMCallListStatus;

  // When an agent opens a household it gets locked — auto-released after 30 min
  @Column({ name: "locked_at", type: "timestamptz", nullable: true })
  lockedAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}