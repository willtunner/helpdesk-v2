import { UserType } from "../../../enums/user-types.enum";
import { INavbarData } from "../../../interface/side-nav.interface";

// navbar-data.ts
export const NAVBAR_DATA: INavbarData[] = [
  { routeLink: 'home', icon: 'home', label: 'sideNav.home', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'calls', icon: 'inventory_2', label: 'sideNav.calls', allowedRoles: [UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'companies', icon: 'apartment', label: 'sideNav.companies', allowedRoles: [UserType.ADMIN, UserType.MASTER, UserType.OPERATOR] },
  { routeLink: 'client', icon: 'groups', label: 'sideNav.client', allowedRoles: [UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'system_version', icon: 'system_update_alt', label: 'sideNav.system_version', allowedRoles: [UserType.MASTER] },
  { routeLink: 'chat', icon: 'forum', label: 'sideNav.chat', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'tutorials', icon: 'books_movies_and_music', label: 'sideNav.tutorials', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'mtb_dev', icon: 'code', label: 'sideNav.mtb_dev', allowedRoles: [UserType.MASTER] },
  { routeLink: 'generates_code', icon: 'developer_mode', label: 'sideNav.generates_code', allowedRoles: [UserType.MASTER] },
  { routeLink: 'profile_settings', icon: 'settings', label: 'sideNav.profile_settings', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] },
  { routeLink: 'exit', icon: 'logout', label: 'sideNav.exit', allowedRoles: [UserType.CLIENT, UserType.OPERATOR, UserType.ADMIN, UserType.MASTER] }
];
