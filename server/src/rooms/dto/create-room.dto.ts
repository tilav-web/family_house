import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PriceTierDto {
  @IsNumber()
  @Min(1)
  guests: number;

  @IsNumber()
  @Min(0)
  price: number;
}
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
