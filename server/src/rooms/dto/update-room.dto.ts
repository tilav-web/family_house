import {
  IsString,
  IsObject,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { I18nField } from '../../common/types/i18n-field.type';
import { PriceTierDto } from './create-room.dto';

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

  @IsNumber()
  @IsOptional()
  pricePerNightDouble?: number | null;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PriceTierDto)
  priceTiers?: PriceTierDto[] | null;

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
