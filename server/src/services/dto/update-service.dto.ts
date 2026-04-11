import {
  IsString,
  IsObject,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import type { I18nField } from '../../common/types/i18n-field.type';

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  iconName?: string;

  @IsObject()
  @IsOptional()
  title?: I18nField;

  @IsObject()
  @IsOptional()
  description?: I18nField;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
