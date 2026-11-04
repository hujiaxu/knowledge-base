import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsString()
  username: string;
  
  @IsString()
  password: string;
}

export class RegisterDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6, { message: '密码长度至少为6位' })
  password: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  realName?: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}