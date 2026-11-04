import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  realName?: string

  @IsOptional()
  @IsString()
  avatar?: string
}