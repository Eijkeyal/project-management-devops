import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

// SRS 5.7: categories with an optional hierarchy (parent_id -> another category).
@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  category_id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 120, unique: true })
  slug!: string;

  @Column({ type: "uuid", nullable: true })
  parent_id!: string | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @ManyToOne(() => Category, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "parent_id" })
  parent?: Category | null;
}
