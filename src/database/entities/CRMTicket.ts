import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany,
} from "typeorm";
import { CRMUser } from "./CRMUser";
import { CRMCallLog } from "./CRMCallLog";
import { Household } from "./Household";
import { CRMTicketUpdate } from "./CRMTicketUpdate";

export enum CRMTicketStatus {
  OPEN        = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED    = "RESOLVED",
  CLOSED      = "CLOSED",
  REOPENED    = "REOPENED",
}

export enum CRMTicketTeam {
  TECHNICAL        = "TECHNICAL",
  FIELD_TECHNICIAN = "FIELD_TECHNICIAN",
}

export enum CRMTicketPriority {
  HIGH   = "HIGH",
  MEDIUM = "MEDIUM",
  LOW    = "LOW",
}

@Entity({ name: "crm_tickets" })
export class CRMTicket {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "call_log_id", type: "uuid", nullable: true })
  callLogId?: string | null;

  @ManyToOne(() => CRMCallLog, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "call_log_id" })
  callLog?: CRMCallLog;

  @Column({ name: "device_id", type: "varchar", length: 50, nullable: true })
  deviceId?: string | null;

  @Column({ name: "household_id", type: "uuid", nullable: true })
  householdId?: string | null;

  @ManyToOne(() => Household, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "household_id" })
  household?: Household;

  @Column({ type: "varchar", length: 10, nullable: true })
  hhid?: string | null;

  // Panel Manager who raised the ticket
  @Column({ name: "raised_by", type: "uuid" })
  raisedBy!: string;

  @ManyToOne(() => CRMUser, { onDelete: "SET NULL" })
  @JoinColumn({ name: "raised_by" })
  raisedByUser!: CRMUser;

  @Column({ name: "raised_at", type: "timestamptz", default: () => "now()" })
  raisedAt!: Date;

  @Column({ name: "assigned_team", type: "varchar", length: 30 })
  assignedTeam!: CRMTicketTeam;

  // Specific person in the team (optional)
  @Column({ name: "assigned_to", type: "uuid", nullable: true })
  assignedTo?: string | null;

  @ManyToOne(() => CRMUser, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "assigned_to" })
  assignedToUser?: CRMUser;

  @Column({ name: "issue_tag", type: "varchar", length: 50, nullable: true })
  issueTag?: string | null;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ type: "varchar", length: 10, default: CRMTicketPriority.MEDIUM })
  priority!: CRMTicketPriority;

  @Column({ type: "varchar", length: 20, default: CRMTicketStatus.OPEN })
  status!: CRMTicketStatus;

  // Filled by team when marking RESOLVED
  @Column({ name: "resolution_notes", type: "text", nullable: true })
  resolutionNotes?: string | null;

  @Column({ name: "resolved_at", type: "timestamptz", nullable: true })
  resolvedAt?: Date | null;

  // Panel Manager who closed the ticket
  @Column({ name: "closed_by", type: "uuid", nullable: true })
  closedBy?: string | null;

  @ManyToOne(() => CRMUser, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "closed_by" })
  closedByUser?: CRMUser;

  @Column({ name: "closed_at", type: "timestamptz", nullable: true })
  closedAt?: Date | null;

  @OneToMany(() => CRMTicketUpdate, (update) => update.ticket)
  updates!: CRMTicketUpdate[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}