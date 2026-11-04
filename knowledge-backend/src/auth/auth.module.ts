import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { RoleEntity } from '../user/entities/role.entity';
import { UserRoleEntity } from '../user/entities/user-role.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { UserModule } from '../user/user.module';
import { EmailService } from './email.service';
import { EmailActivationService } from './email-activation.service';
import { PasswordResetService } from './password-reset.service';
import { PermissionGuard } from './permission.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MailerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-secret-change-me'),
      })
    }),
    TypeOrmModule.forFeature([UserEntity, RoleEntity, UserRoleEntity]),
    UserModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    EmailActivationService,
    PasswordResetService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    }
  ],
  exports: [AuthService, UserModule]
})
export class AuthModule {}
