import { UserType } from "../enums/user-types.enum";

export interface Company {
    id: string;
    name: string;
    keywords: string[];
    created: Date;
    updated: Date; 
    cnpj: string;
    city: string;
    state: string;
    address: string;
    zipcode: string;
    phone: string;
    connectionServ: string;
    email: string;
    versionServ: string | null;
    clients: User[];
  }

  export interface Call {
    id: string;
    deleted: boolean;
    created: Date;  
    updated: Date;  
    companyId: string;
    company?: Company | null;
    clientId: string;
    client: User;
    title: string;
    description: string;
    resolution: string;
    tags: string[];
    connection: string;
    closed: boolean;
    finalized: Date;
    operatorId: string;
    operator?: User;
    user?: User | null;
  }

  export interface User {
    id: string;
    name: string;
    username: string;
    phone: string;
    email: string;
    password?: string; // Opcional para casos onde você não quer carregar a senha
    companyId?: string; // Opcional para clientes que não são de uma empresa
    roles: string[]; // Define as permissões (ex: ['client'], ['employee'], ['admin'], etc.)
    deleted: boolean;
    created: Date;
    updated: Date | null;
    imageUrl: string;
    company?: Company | null; // Opcional
    occurrency?: string; // Opcional, específico para clientes
    connection?: string | null; // Opcional, específico para funcionários
    userId?: string; // Opcional, específico para funcionários
    userType: UserType; // Campo explícito para diferenciar os tipos
  }

  export interface ChatRoom {
    id: string;
    close: boolean;
    created: Date;
    updated?: Date | null;
    operator: User;
    client: User;
    mensages: Message[],
    unreadCount?: number;
  }

  export interface Message {
    sender: string;        
    content: string;       
    timestamp: Date;       
    imageUrl: string;
    uploadImg?: string;    
    isRead?: boolean;  
  }

  export interface DropDownVideos {
    id?: string;
    dropdownText: string;
    videos: Video[];
  }
  
  export interface Video {
    id?: string;
    url: string;
    title: string;
    created: Date;
    imgProfile: string;
    nameProfile: string;
    sector: string;
  }

  export interface VersionSistem {
    id?: string;
    version: string;
    overviewText: string;
    summaryList: Sumary[];
    newChangesReview: string;
    aprovedBy: string[];
    create: Date;
  }

  export interface Sumary {
    id?:  string;
    userId: string;
    title: string;
    description: string;
    author: string;
    create: Date;
    developer: string;
    comments?: CommentsVersion[];
    close: boolean;
    images?: string[];
  }

  export interface CommentsVersion {
    userId: string;
    comment: string;
    create: Date;
  }

