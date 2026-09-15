import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from "typeorm";
import { CRMUser } from "./CRMUser";

export enum CRMRulePriority {
  HIGH   = "HIGH",
  MEDIUM = "MEDIUM",
  LOW    = "LOW",
}

@Entity({ name: "crm_rules" })
export class CRMRule {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  // References event_mapping.type (36=connectivity, 42=fingerprint, 29=img recognised, 30=img unrecognised)
  @Column({ name: "event_type", type: "integer" })
  eventType!: number;

  // Stores the rule logic e.g. { "metric": "connectivity", "operator": "equals", "value": false, "min_days": 3 }
  @Column({ type: "jsonb", default: {} })
  condition!: Record<string, any>;

  @Column({ name: "lookback_days", type: "integer", default: 4 })
  lookbackDays!: number;

  @Column({
    type: "varchar",
    length: 10,
    default: CRMRulePriority.MEDIUM,
  })
  priority!: CRMRulePriority;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "created_by", type: "uuid" })
  createdBy!: string;

  @ManyToOne(() => CRMUser, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "created_by" })
  creator?: CRMUser;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}