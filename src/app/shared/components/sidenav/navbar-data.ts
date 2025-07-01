import { INavbarData } from "../../../interface/side-nav.interface";

export const NAVBAR_DATA: INavbarData[] = [
  { routeLink: 'home', icon: 'home', label: 'Home' },
  { routeLink: 'calls', icon: 'inventory_2', label: 'Chamados' },
  { routeLink: 'companies', icon: 'apartment', label: 'Empresas' },
  { routeLink: 'client', icon: 'groups', label: 'Cliente' },
  { routeLink: 'system_version', icon: 'system_update_alt', label: 'Ver. Sistema' },
  { routeLink: 'chat', icon: 'forum', label: 'Chat' },
  { routeLink: 'tutorials', icon: 'books_movies_and_music', label: 'Videos/Docs' },
  { routeLink: 'mtb_dev', icon: 'code', label: 'MTB DEV' },
  { routeLink: 'generates_code', icon: 'developer_mode', label: 'Gera Código' },
  { routeLink: 'profile_settings', icon: 'settings', label: 'Configurações' },
  { routeLink: 'exit', icon: 'logout', label: 'Sair' }
];
