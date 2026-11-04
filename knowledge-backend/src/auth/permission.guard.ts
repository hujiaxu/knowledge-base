import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "./decorators.ts/require-permission.decorator";
import { AuthUser } from "./auth-user.interface";
import { RoleCode } from "../common/constants/roles";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('权限不足');
    }
    if (user.roles.includes(RoleCode.ADMIN)) {
      return true;
    }

    const owned = new Set(user.permissions ?? []);
    const ok = required.some((p) => owned.has(p));
    if (!ok) {
      throw new ForbiddenException('权限不足');
    }
    return true;
  }
}