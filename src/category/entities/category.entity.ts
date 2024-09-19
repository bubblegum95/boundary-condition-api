import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Article from '../../article/entities/article.entity';

@Entity({ name: 'category' })
export default class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, length: 8, unique: true })
  name: string;

  @Column({ type: 'int', nullable: false, unique: false, unsigned: true })
  number: number;

  @Column({ type: 'boolean', nullable: false, default: true })
  accessible: boolean;

  @Column({ type: 'boolean', nullable: false, default: true })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Article, (article) => article.category)
  article: Article;
}
