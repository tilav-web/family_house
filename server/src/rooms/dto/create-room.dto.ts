import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PriceTierDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\s*-\s*\d+)?$/, {
    message: "Kishi soni '1', '2' yoki '3-5' ko'rinishida bo'lishi kerak",
  })
  guests: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number | null;
}
import type { I18nField } from '../../common/types/i18n-field.type';

export class CreateRoomDto {
  @IsObject()
  @IsNotEmpty()
  name: I18nField;

  @IsObject()
  @IsOptional()
  description?: I18nField;

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
