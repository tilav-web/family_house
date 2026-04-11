import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import type { I18nField } from '../../common/types/i18n-field.type';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  iconName: string;

  @IsObject()
  @IsNotEmpty()
  title: I18nField;

  @IsObject()
  @IsNotEmpty()
  description: I18nField;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
