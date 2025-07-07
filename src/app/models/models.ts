import { Operator } from "rxjs";

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
    clients: Client[];
  }

  export interface Call {
    id: string;
    deleted: boolean;
    created: Date;  
    updated: Date;  
    companyId: string;
    company?: Company | null;
    clientId: string;
    client: Client;
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

  export interface Client {
    id: string;
    name: string;
    username: string;
    phone: string;
    email: string;
    companyId: string;
    roles: string[];
    deleted: boolean;
    created: Date;
    updated: Date | null;
    imageUrl: string;
    company: Company | null;
    occurrency?: string;
  }

  export interface HelpDeskCompany {
    id: string;
    name: string;
    keywords: string[]; // Lista de palavras-chave para busca, salvar o nome da empresa em palavra-chave em minusculo
    created: Date; // timestamp formato do firebase (1 de julho de 2025 às 11:35:36 UTC-3), salvar no formato Date e criar um pipe para exibir a data no formato "01/07/2025 - 11:35:36" 
    updated: Date; // timestamp formato do firebase (1 de julho de 2025 às 11:35:36 UTC-3), salvar no formato Date e criar um pipe para exibir a data no formato "01/07/2025 - 11:35:36" 
    cnpj: number;
    city: string;
    state: string;
    address: string;
    neighborhood: string;
    zipcode: number;
    phone: number;
    email: string;
    companies: Company[];
    employees: User[];
    password?: string;
    active: boolean;
  }

  export interface User {
    id: string;
    deleted: boolean;
    created: Date;
    updated?: Date | null;
    username: string;
    phone: string;
    email: string;
    password: string;
    connection?: string | null;
    userId?: string;
    imageUrl: string;
    roles: string[];
  }

  export interface UserClient {
    id: string;
    created: number;
    deleted: boolean;
    email: string;
    phone: string;
    username: string;
    name: string;
    roles: string[];
    password: string;
    updated: number;
    connection: string;
    imageUrl: string;
    userId: string
    companyId?: string;
    occurrency?: string;
    company?: Company;
    isLoggedIn: boolean;
  }

  export interface ChatRoom {
    id: string;
    close: boolean;
    created: Date;
    updated?: Date | null;
    operator: User;
    client: Client;
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

