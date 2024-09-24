export class CreateArticleDto {
  userId: number;
  title: string;
  subtitle: string;
  link: string;
  thumbnailId: number;
  categoryId: number;
  isPublic: boolean;
}
