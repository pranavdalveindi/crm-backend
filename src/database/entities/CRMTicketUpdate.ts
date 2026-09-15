import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from "typeorm";
import { CRMUser } from "./CRMUser";
import { CRMTicket } from "./CRMTicket";

export enum CRMTicketUpdateType {
  STATUS_CHANGE = "STATUS_CHANGE",
  COMMENT       = "COMMENT",
  ASSIGNMENT    = "ASSIGNMENT",
}

@Entity({ name: "crm_ticket_updates" })
export class CRMTicketUpdate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "ticket_id", type: "uuid" })
  ticketId!: string;

  @ManyToOne(() => CRMTicket, (ticket) => ticket.updates, { onDelete: "CASCADE" })
  @JoinColumn({ name: "ticket_id" })
  ticket!: CRMTicket;

  @Column({ name: "updated_by", type: "uuid" })
  updatedBy!: string;

  @ManyToOne(() => CRMUser, { onDelete: "SET NULL" })
  @JoinColumn({ name: "updated_by" })
  updatedByUser!: CRMUser;

  @Column({ name: "update_type", type: "varchar", length: 20 })
  updateType!: CRMTicketUpdateType;

  @Column({ name: "old_status", type: "varchar", length: 20, nullable: true })
  oldStatus?: string | null;

  @Column({ name: "new_status", type: "varchar", length: 20, nullable: true })
  newStatus?: string | null;

  @Column({ type: "text", nullable: true })
  comment?: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}