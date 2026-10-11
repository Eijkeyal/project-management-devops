import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Content } from "./content.entity";
import { Category } from "./category.entity";

@Entity("content_categories")
export class ContentCategory {
  @Column({ type: "uuid", primary: true })
  content_id!: string;

  @Column({ type: "uuid", primary: true })
  category_id!: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @ManyToOne(() => Content, { onDelete: "CASCADE" })
  @JoinColumn({ name: "content_id" })
  content!: Content;

  @ManyToOne(() => Category, { onDelete: "CASCADE" })
  @JoinColumn({ name: "category_id" })
  category!: Category;
}
