// navbar-data.ts
import { UserType } from "../../../enums/user-types.enum";
import { INavbarData } from "../../../interface/side-nav.interface";

export const NAVBAR_DATA: INavbarData[] = [
  { routeLink: 'home', icon: 'home', label: 'Home', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'calls', icon: 'inventory_2', label: 'Chamados', allowedRoles: [UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'companies', icon: 'apartment', label: 'Empresas', allowedRoles: [UserType.ADMIN, UserType.MASTER, UserType.OPERATOR] },
  { routeLink: 'client', icon: 'groups', label: 'Cliente', allowedRoles: [UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'system_version', icon: 'system_update_alt', label: 'Ver. Sistema', allowedRoles: [UserType.MASTER] },
  { routeLink: 'chat', icon: 'forum', label: 'Chat', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'tutorials', icon: 'books_movies_and_music', label: 'Videos/Docs', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'mtb_dev', icon: 'code', label: 'MTB DEV', allowedRoles: [UserType.MASTER] },
  { routeLink: 'generates_code', icon: 'developer_mode', label: 'Gera Código', allowedRoles: [UserType.MASTER] },
  { routeLink: 'profile_settings', icon: 'settings', label: 'Configurações', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'exit', icon: 'logout', label: 'Sair', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] }
];
