import {
  IsString,
  IsObject,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import type { I18nField } from '../../common/types/i18n-field.type';

export class UpdateRoomDto {
  @IsObject()
  @IsOptional()
  name?: I18nField;

  @IsObject()
  @IsOptional()
  description?: I18nField;

  @IsNumber()
  @IsOptional()
  pricePerNight?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsObject()
  @IsOptional()
  amenities?: I18nField;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
