import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Project } from "./project.entity.js";
import { User } from "./user.entity.js";

@Entity("project_members")
export class ProjectMember {
  @Column({ type: "uuid", primary: true })
  project_id!: string;

  @Column({ type: "uuid", primary: true })
  user_id!: string;

  @Column({ type: "varchar", length: 20 })
  role!: string;

  @CreateDateColumn({ type: "timestamp" })
  joined_at!: Date;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "project_id" })
  project!: Project;

  @ManyToOne(() => User, (user) => user.project_memberships, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: User;
}
