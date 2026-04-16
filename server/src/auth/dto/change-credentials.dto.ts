import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ChangeCredentialsDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  newUsername?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  newPassword?: string;
}
