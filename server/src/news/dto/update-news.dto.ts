import { IsString, IsObject, IsBoolean, IsOptional } from 'class-validator';
import type { I18nField } from '../../common/types/i18n-field.type';

export class UpdateNewsDto {
  @IsObject()
  @IsOptional()
  title?: I18nField;

  @IsObject()
  @IsOptional()
  excerpt?: I18nField;

  @IsObject()
  @IsOptional()
  content?: I18nField;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
