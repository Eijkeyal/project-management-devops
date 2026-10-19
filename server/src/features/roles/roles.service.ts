import { BaseCRUDService } from "../../shared/services/base.service.js";
import { Role } from "../../entities/role.entity.js";

interface CreateRoleDto {
  name: string;
  description?: string;
}

interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export class RolesService extends BaseCRUDService<Role, CreateRoleDto, UpdateRoleDto> {
  constructor() {
    super(Role, "role_id");
  }

  async findAllRoles(): Promise<Role[]> {
    return this.getRepository().find();
  }

  async findByName(name: string): Promise<Role | null> {
    return this.getRepository().findOne({ where: { name } });
  }
}

export const rolesService = new RolesService();
