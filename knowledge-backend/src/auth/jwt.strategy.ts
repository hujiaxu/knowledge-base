import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from 'passport-jwt';


interface JwtPayload {
  sub: string;
  username: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'dev-secret-change-me'),
    });
  }

  async validate(payload: JwtPayload) {

    if (payload.type !== 'access') {
      throw new UnauthorizedException('无效的 access token');
    }
    return this.authService.buildAuthUser(payload.sub);
  }
}