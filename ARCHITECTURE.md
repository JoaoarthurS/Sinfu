# Sinfu - Sistema de Notificações Push

## 📱 Sobre o Projeto

Aplicação React Native desenvolvida com TypeScript que implementa um sistema de autenticação com dois perfis de usuário (comum e administrador), cada um com dashboards personalizados.

## 🏗️ Arquitetura - Princípios SOLID

O projeto foi estruturado seguindo os princípios SOLID para garantir código limpo, manutenível e escalável:

### 📂 Estrutura de Pastas

```
src/
├── config/                 # Configurações da aplicação
│   ├── api.config.ts       # Endpoints e configurações de API
│   └── theme.ts            # Tema e design system
│
├── core/                   # Núcleo da aplicação
│   ├── context/            # React Contexts
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom Hooks
│   │   └── useAuth.ts
│   └── di/                 # Dependency Injection
│       └── container.ts    # Container de injeção de dependências
│
├── domain/                 # Camada de Domínio (Regras de Negócio)
│   ├── entities/           # Entidades do domínio
│   │   └── User.ts
│   ├── interfaces/         # Contratos/Interfaces
│   │   ├── IApiClient.ts
│   │   ├── IAuthRepository.ts
│   │   └── IStorageService.ts
│   └── useCases/           # Casos de uso
│       ├── LoginUseCase.ts
│       └── LogoutUseCase.ts
│
├── data/                   # Camada de Dados (Implementações)
│   ├── repositories/       # Implementação dos repositórios
│   │   └── AuthRepository.ts
│   └── services/           # Serviços concretos
│       ├── AxiosApiClient.ts
│       └── AsyncStorageService.ts
│
├── presentation/           # Camada de Apresentação (UI)
│   ├── components/         # Componentes reutilizáveis
│   │   ├── Card.tsx
│   │   ├── CustomButton.tsx
│   │   └── CustomInput.tsx
│   └── screens/            # Telas da aplicação
│       ├── LoginScreen.tsx
│       ├── UserDashboardScreen.tsx
│       └── AdminDashboardScreen.tsx
│
└── navigation/             # Configuração de rotas
    ├── AppNavigator.tsx
    └── types.ts
```

## 🎯 Princípios SOLID Aplicados

### 1. **S**RP - Single Responsibility Principle
- Cada classe/módulo tem uma única responsabilidade
- `LoginUseCase`: apenas lógica de login
- `AuthRepository`: apenas operações de autenticação
- `AxiosApiClient`: apenas comunicação HTTP

### 2. **O**CP - Open/Closed Principle
- Uso de interfaces para extensibilidade
- Interceptors no Axios para adicionar funcionalidades sem modificar o core
- Componentes reutilizáveis com props para variações

### 3. **L**SP - Liskov Substitution Principle
- Implementações de interfaces são substituíveis
- `AxiosApiClient` implementa `IApiClient` e pode ser substituído por qualquer outra implementação

### 4. **I**SP - Interface Segregation Principle
- Interfaces específicas e coesas
- `IStorageService`: apenas operações de storage
- `IApiClient`: apenas operações HTTP

### 5. **D**IP - Dependency Inversion Principle
- Dependência de abstrações, não de implementações
- `AuthRepository` depende de `IApiClient` e `IStorageService`
- Container de DI gerencia todas as dependências

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 20
- React Native CLI configurado
- Android Studio (para Android) ou Xcode (para iOS)

### Instalação

```bash
# Instalar dependências
npm install

# Para iOS (apenas macOS)
cd ios && pod install && cd ..

# Executar no Android
npm run android

# Executar no iOS
npm run ios
```

## 🔐 Credenciais de Teste

### Usuário Comum
- **Email**: user@example.com
- **Senha**: user123
- **Acesso**: Recebe notificações básicas

### Administrador
- **Email**: admin@example.com
- **Senha**: admin123
- **Acesso**: Painel administrativo completo

## 📱 Funcionalidades

### Tela de Login
- Validação de formulário
- Autenticação com API
- Seleção de perfil (User/Admin)
- Credenciais de demonstração

### Dashboard do Usuário
- Visualização de notificações básicas
- Estatísticas de notificações
- Perfil do usuário
- Ações rápidas

### Dashboard do Administrador
- Notificações administrativas priorizadas
- Alertas críticos em destaque
- Painel de controle com métricas
- Ferramentas administrativas
- Gestão de usuários

## 🔌 Integração com API

A aplicação está configurada para se integrar com a API Laravel localizada em `api-push-notification/`.

### Configuração da API

Edite o arquivo [src/config/api.config.ts](src/config/api.config.ts):

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://10.0.2.2:8000/api'  // Android Emulator
    : 'https://sua-api-producao.com/api',
  TIMEOUT: 30000,
};
```

### Endpoints Utilizados

- `POST /api/auth/login` - Autenticação
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário autenticado
- `GET /api/notifications` - Lista de notificações

## 🛠️ Tecnologias Utilizadas

- **React Native 0.83** - Framework mobile
- **TypeScript 5.8** - Linguagem
- **React Navigation** - Navegação entre telas
- **Axios** - Cliente HTTP
- **AsyncStorage** - Armazenamento local
- **React Context API** - Gerenciamento de estado

## 📐 Padrões de Projeto

### Clean Architecture
- Separação em camadas (Domain, Data, Presentation)
- Independência de frameworks
- Testabilidade

### Repository Pattern
- Abstração da camada de dados
- Facilita testes e manutenção

### Dependency Injection
- Gerenciamento centralizado de dependências
- Facilita testes com mocks

### Use Cases
- Encapsulamento da lógica de negócio
- Reutilização de código

## 🧪 Testes

```bash
# Executar testes
npm test

# Com coverage
npm test -- --coverage
```

## 📝 Próximos Passos

- [ ] Implementar push notifications reais
- [ ] Adicionar testes unitários e de integração
- [ ] Implementar refresh token
- [ ] Adicionar i18n (internacionalização)
- [ ] Implementar dark mode
- [ ] Adicionar analytics
- [ ] Implementar cache de requisições
- [ ] Adicionar tratamento offline-first

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

Desenvolvido com ❤️ usando React Native e TypeScript
