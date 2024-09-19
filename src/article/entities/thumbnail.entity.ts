import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import Article from './article.entity';

@Entity({ name: 'thumbnail' })
export default class Thumbnail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  path: string;

  @OneToOne(() => Article, (article) => article.thumbnail)
  article: Article;
}
