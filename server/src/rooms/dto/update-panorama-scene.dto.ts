import { IsBoolean, IsNumber, IsObject, IsOptional } from 'class-validator';
import type { I18nField } from '../../common/types/i18n-field.type';

export class UpdatePanoramaSceneDto {
  @IsObject()
  @IsOptional()
  title?: I18nField;

  @IsNumber()
  @IsOptional()
  initialYaw?: number;

  @IsNumber()
  @IsOptional()
  initialPitch?: number;

  @IsNumber()
  @IsOptional()
  initialHfov?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
