import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./decorators.ts/roles.decorator";
import { RoleCodeValue } from "../common/constants/roles";
import { AuthUser } from "./auth-user.interface";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {

    const requiredRoles = this.reflector.getAllAndOverride<RoleCodeValue[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;
    if (!user?.roles?.length) {
      throw new ForbiddenException('权限不足');
    }

    const ok = requiredRoles.some((role) => user.roles.includes(role));
    if (!ok) {
      throw new ForbiddenException('权限不足');
    }
    return true;
  }
}