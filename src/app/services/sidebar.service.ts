// services/sidebar.service.ts
import { Injectable } from '@angular/core';
import { INavbarData } from '../interface/side-nav.interface';
import { NAVBAR_DATA } from '../shared/components/sidenav/navbar-data';
import { UserType } from '../enums/user-types.enum';
import { User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  /** Retorna os menus permitidos conforme a role efetiva do usuário */
  getMenuForUser(user: User): INavbarData[] {
    const role = this.getEffectiveUserRole(user);
    return NAVBAR_DATA.filter((menu: any) =>
      !menu.allowedRoles || menu.allowedRoles.includes(role)
    );
  }

  getEffectiveUserRole(user: User): UserType | null {
    if (!user || !user.roles || user.roles.length === 0) {
      return null;
    }
  
    const roles = user.roles.map(r => r.toLowerCase());
  
    // Se tiver apenas uma role, retorna direto
    if (roles.length === 1) {
      return roles[0] as UserType;
    }
  
    const hasOperatorOrClient = roles.includes(UserType.OPERATOR) || roles.includes(UserType.CLIENT);
    const hasMasterOrAdmin = roles.includes(UserType.MASTER) || roles.includes(UserType.ADMIN);
  
    if (hasOperatorOrClient && hasMasterOrAdmin) {
      if (roles.includes(UserType.MASTER)) return UserType.MASTER;
      if (roles.includes(UserType.ADMIN)) return UserType.ADMIN;
    }
  
    // Caso não caia na lógica acima, retorna pela prioridade
    const priority: UserType[] = [UserType.MASTER, UserType.ADMIN, UserType.OPERATOR, UserType.CLIENT];
    for (const role of priority) {
      if (roles.includes(role)) return role;
    }
  
    return null;
  }
}
