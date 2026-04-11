import { IsOptional, IsObject } from 'class-validator';
import type { I18nField } from '../../common/types/i18n-field.type';

export class UpdateHotelInfoDto {
  @IsOptional()
  @IsObject()
  description?: I18nField;

  @IsOptional()
  heroText?: I18nField;

  @IsOptional()
  heroSubtext?: I18nField;
}
