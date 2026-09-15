import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from "typeorm";
import { CRMUser } from "./CRMUser";
import { CRMCallList } from "./CRMCallList";
import { Household } from "./Household";

export enum CRMCallOutcome {
  RESOLVED  = "RESOLVED",
  ESCALATED = "ESCALATED",
  NO_ANSWER = "NO_ANSWER",
  CALLBACK  = "CALLBACK",
}

@Entity({ name: "crm_call_logs" })
export class CRMCallLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "call_list_id", type: "uuid", nullable: true })
  callListId?: string | null;

  @ManyToOne(() => CRMCallList, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "call_list_id" })
  callListEntry?: CRMCallList;

  @Column({ name: "agent_id", type: "uuid" })
  agentId!: string;

  @ManyToOne(() => CRMUser, { onDelete: "SET NULL" })
  @JoinColumn({ name: "agent_id" })
  agent!: CRMUser;

  @Column({ name: "device_id", type: "varchar", length: 50, nullable: true })
  deviceId?: string | null;

  @Column({ name: "household_id", type: "uuid", nullable: true })
  householdId?: string | null;

  @ManyToOne(() => Household, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "household_id" })
  household?: Household;

  // Populated from Twilio webhook — system generated, not agent input
  @Column({ name: "called_at", type: "timestamptz", nullable: true })
  calledAt?: Date | null;

  @Column({ name: "duration_seconds", type: "integer", nullable: true })
  durationSeconds?: number | null;

  @Column({ name: "twilio_call_sid", type: "varchar", length: 100, nullable: true })
  twilioCallSid?: string | null;

  @Column({ name: "twilio_status", type: "varchar", length: 20, nullable: true })
  twilioStatus?: string | null;

  // S3 path — never a public URL, always accessed via signed URL
  @Column({ name: "recording_s3_url", type: "text", nullable: true })
  recordingS3Url?: string | null;

  // Agent fills these after the call
  @Column({ type: "varchar", length: 20, nullable: true })
  outcome?: CRMCallOutcome | null;

  @Column({ name: "issue_tags", type: "text", array: true, nullable: true })
  issueTags?: string[] | null;

  @Column({ type: "text", nullable: true })
  notes?: string | null;

  @Column({ name: "escalated_to", type: "uuid", nullable: true })
  escalatedTo?: string | null;

  @ManyToOne(() => CRMUser, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "escalated_to" })
  escalatedToUser?: CRMUser;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}