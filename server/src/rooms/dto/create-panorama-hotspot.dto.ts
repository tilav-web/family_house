import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import type { I18nField } from '../../common/types/i18n-field.type';
import type { PanoramaHotspotType } from '../entities/panorama-hotspot.entity';

export class CreatePanoramaHotspotDto {
  @IsString()
  @IsIn(['scene', 'info'])
  type: PanoramaHotspotType;

  @IsObject()
  @IsNotEmpty()
  label: I18nField;

  @IsNumber()
  yaw: number;

  @IsNumber()
  pitch: number;

  @IsString()
  @IsOptional()
  targetSceneId?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsNumber()
  @IsOptional()
  targetYaw?: number;

  @IsNumber()
  @IsOptional()
  targetPitch?: number;

  @IsNumber()
  @IsOptional()
  targetHfov?: number;

  @IsNumber()
  @IsOptional()
  order?: number;
}
