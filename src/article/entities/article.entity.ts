import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Thumbnail from './thumbnail.entity';
import Category from '../../category/entities/category.entity';

@Entity({ name: 'article' })
export default class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: false, length: 60 })
  title: string;

  @Column({ type: 'varchar', nullable: false, length: 60 })
  subtitle: string;

  @Column({ type: 'varchar', nullable: false, length: 100 })
  link: string;

  @Column({ type: 'int', nullable: true })
  thumbnailId: number;

  @Column({ type: 'int', nullable: false, unique: false })
  categoryId: number;

  @Column({ type: 'boolean', nullable: false, default: true })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Thumbnail, (thumbnail) => thumbnail.article)
  @JoinColumn({ name: 'thumbnail_id' })
  thumbnail: Thumbnail;

  @ManyToOne(() => Category, (category) => category.article)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
