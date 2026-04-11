import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import type { I18nField } from '../../common/types/i18n-field.type';

export class CreateRoomDto {
  @IsObject()
  @IsNotEmpty()
  name: I18nField;

  @IsObject()
  @IsOptional()
  description?: I18nField;

  @IsNumber()
  @IsNotEmpty()
  pricePerNight: number;

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
