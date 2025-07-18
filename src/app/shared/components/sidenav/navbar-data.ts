import { UserType } from "../../../enums/user-types.enum";
import { INavbarData } from "../../../interface/side-nav.interface";

// navbar-data.ts
export const NAVBAR_DATA: INavbarData[] = [
  { routeLink: 'home', icon: 'home', label: 'sideNav.home', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'calls', icon: 'inventory_2', label: 'sideNav.tickets', allowedRoles: [UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'companies', icon: 'apartment', label: 'sideNav.enterprises', allowedRoles: [UserType.ADMIN, UserType.MASTER, UserType.OPERATOR] },
  { routeLink: 'clients', icon: 'groups', label: 'sideNav.clients', allowedRoles: [UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'system-version', icon: 'system_update_alt', label: 'sideNav.system-version', allowedRoles: [UserType.MASTER] },
  { routeLink: 'chat', icon: 'forum', label: 'sideNav.chat', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'tutorials', icon: 'books_movies_and_music', label: 'sideNav.video-docs', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'developer-area', icon: 'code', label: 'sideNav.developer-area', allowedRoles: [UserType.MASTER] },
  { routeLink: 'restricted-area', icon: 'developer_mode', label: 'sideNav.restricted-area', allowedRoles: [UserType.MASTER] },
  { routeLink: 'profile-settings', icon: 'settings', label: 'sideNav.settings', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'exit', icon: 'logout', label: 'sideNav.logout', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] }
];
