import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
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

  @IsString()
  @IsOptional()
  targetForwardId?: string | null;

  @IsNumber()
  @IsOptional()
  targetForwardYaw?: number | null;

  @IsString()
  @IsOptional()
  targetRightId?: string | null;

  @IsNumber()
  @IsOptional()
  targetRightYaw?: number | null;

  @IsString()
  @IsOptional()
  targetBackId?: string | null;

  @IsNumber()
  @IsOptional()
  targetBackYaw?: number | null;

  @IsString()
  @IsOptional()
  targetLeftId?: string | null;

  @IsNumber()
  @IsOptional()
  targetLeftYaw?: number | null;
}
