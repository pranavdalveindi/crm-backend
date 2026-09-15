import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum CRMUserRole {
  PANEL_MANAGER = "panel_manager",
  CALL_AGENT = "call_agent",
  DEVELOPER = "developer",
}

/** CRM accounts are deliberately isolated from the Indirex `users` table. */
@Entity({ name: "crm_users" })
export class CRMUser {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  // varchar avoids coupling this table to the existing Indirex role enum.
  @Column({ type: "varchar", length: 30 })
  role!: CRMUserRole;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ name: "must_change_password", type: "boolean", default: true })
  mustChangePassword!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
