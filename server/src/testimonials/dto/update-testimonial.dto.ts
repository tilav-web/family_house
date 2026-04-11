import {
  IsString,
  IsObject,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import type { I18nField } from '../../common/types/i18n-field.type';

export class UpdateTestimonialDto {
  @IsString()
  @IsOptional()
  authorName?: string;

  @IsString()
  @IsOptional()
  authorPhotoUrl?: string;

  @IsObject()
  @IsOptional()
  text?: I18nField;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
