export enum UserType {
    CLIENT = 'client',
    OPERATOR = 'operator',
    ADMIN = 'admin',
    MASTER = 'master',
}

/*
    MASTER: acesso total a todas as funcionalidades do sistema, incluindo 
    gerenciamento de usuários e configurações avançadas.
    ADMIN: acesso a funcionalidades administrativas, como gerenciamento 
    de usuários e configurações, mas sem acesso a dados sensíveis de clientes.
    OPERATOR: acesso a funcionalidades operacionais, como criação e 
    gerenciamento de chamados, mas sem
    CLIENT: acesso limitado a funcionalidades de cliente, como visualização
    de chamados e informações da empresa.
*/