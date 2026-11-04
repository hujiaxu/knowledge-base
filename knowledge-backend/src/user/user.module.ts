import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { RoleEntity } from "./entities/role.entity";
import { UserRoleEntity } from "./entities/user-role.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { DocumentEntity } from "../document/entities/document.entity";
import { Module } from "@nestjs/common";
import { RoleController } from "./role.controller";
import { RoleService } from "./role.service";
import { PermissionController } from "./permission.controller";
import { PermissionService } from "./permission.service";
import { PermissionEntity } from "./entities/permission.entity";
import { RolePermissionEntity } from "./entities/role-permission.entity";
import { UserPermissionEntity } from "./entities/user-permission.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      UserRoleEntity,
      DocumentEntity,
      PermissionEntity,
      RolePermissionEntity,
      UserPermissionEntity
    ]),
  ],
  controllers: [UserController, RoleController, PermissionController],
  providers: [UserService, RoleService, PermissionService],
  exports: [UserService, RoleService, PermissionService],
})
export class UserModule {}