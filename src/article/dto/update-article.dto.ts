export default class UpdateArticleDto {
  userId: number;
  title: string;
  subtitle: string;
  link: string;
  thumbnailId: number;
  categoryId: number;
  isPublic: boolean;
  createdAt: Date;
}
