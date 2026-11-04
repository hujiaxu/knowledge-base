import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators.ts/public.decorator';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { CurrentUser } from './decorators.ts/current-user.decorator';
import type { AuthUser } from './auth-user.interface';
import { Roles } from './decorators.ts/roles.decorator';
import { RoleCode } from '../common/constants/roles';
import { ResetPasswordByEmailDto, SendResetCodeDto } from '../user/dto/extra.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }
  
  @Public()
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('password/reset/send-code')
  sendResetCode(@Body() dto: SendResetCodeDto) {
    return this.authService.sendResetCode(dto);
  }
  
  @Public()
  @Post('password/reset')
  resetPassword(@Body() dto: ResetPasswordByEmailDto) {
    return this.authService.resetPasswordByEmail(dto);
  }

  /** 无状态 JWT：客户端丢弃 token 即可 */
  @Post('logout')
  logout() {
    return { message: '已退出登录' };
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.authService.getMe(user.userId);
  }


  @Get('reviewer-ids')
  @Roles(RoleCode.ADMIN, RoleCode.REVIEWER)
  getReviewerIds() {
    return this.authService.getReviewerIds();
  }
}
