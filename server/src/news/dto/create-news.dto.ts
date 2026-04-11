import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import type { I18nField } from '../../common/types/i18n-field.type';

export class CreateNewsDto {
  @IsObject()
  @IsNotEmpty()
  title: I18nField;

  @IsObject()
  @IsNotEmpty()
  excerpt: I18nField;

  @IsObject()
  @IsNotEmpty()
  content: I18nField;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
