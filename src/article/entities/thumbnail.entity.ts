import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Article from './article.entity';

@Entity({ name: 'thumbnail' })
export default class Thumbnail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  path: string;

  @ManyToOne(() => Article, (article) => article.thumbnail)
  article: Article[];
}
