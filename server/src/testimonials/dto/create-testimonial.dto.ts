import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsNumber,
  IsBoolean,
  IsOptional,
  Length,
  Min,
  Max,
} from 'class-validator';
import type { I18nField } from '../../common/types/i18n-field.type';

export class CreateTestimonialDto {
  @IsString()
  @IsNotEmpty()
  authorName: string;

  @IsString()
  @IsOptional()
  authorPhotoUrl?: string;

  @IsString()
  @IsOptional()
  @Length(2, 2)
  authorCountry?: string;

  @IsObject()
  @IsNotEmpty()
  text: I18nField;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
