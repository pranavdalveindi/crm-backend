// src/database/entities/Household.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import { Member } from "./Member";
import { Meter } from "./Meter";
import { PreregisteredContact } from "./PreregisteredContact";
import { MeterAssignment } from "./MeterAssignment";

@Entity({ name: "households" })
export class Household {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 10, unique: true })
  hhid!: string;

  @Column({ type: "varchar", length: 100, nullable: true, name: "city" })
  city?: string | null;

  @Column({ type: "varchar", length: 100, nullable: true, name: "region" })
  region?: string | null;

  /**
   * Encrypted phone number — stored as iv:authTag:ciphertext (AES-256-GCM).
   * NEVER return this field raw in any API response.
   * Use maskPhone() for display, decryptPhone() only when initiating a Twilio call.
   */
  @Column({
    name: "phone_number_encrypted",
    type: "varchar",
    length: 500,
    nullable: true,
    select: false,  // TypeORM will NOT include this in any query by default
  })
  phoneNumberEncrypted?: string | null;

  /**
   * Contact name for the household — safe to display.
   */
  @Column({
    name: "contact_name",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  contactName?: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  // Relations
  @OneToMany(() => Member, (member) => member.household)
  members!: Member[];

  @OneToMany(() => Meter, (meter) => meter.assignedHousehold)
  meters!: Meter[];

  @OneToMany(() => MeterAssignment, (assignment) => assignment.household)
  assignments!: MeterAssignment[];

  @OneToMany(() => PreregisteredContact, (contact) => contact.household)
  contacts!: PreregisteredContact[];
}