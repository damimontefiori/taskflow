# TaskFlow - Documento Técnico

## Información General
- **Proyecto:** TaskFlow - Aplicación de Gestión de Tareas
- **Versión:** 1.0
- **Fecha:** 24 de julio de 2025
- **Tipo:** Demo/Prototipo
- **Arquitectura:** Aplicación Web con separación Frontend/Backend

---

## Stack Tecnológico

### Backend
- **.NET 8 Web API**: Framework principal para el desarrollo de la API REST
- **Entity Framework Core**: ORM para manejo de base de datos
- **SQL Server**: Base de datos relacional local
- **JWT Authentication**: Autenticación basada en tokens
- **AutoMapper**: Mapeo entre entidades y DTOs
- **FluentValidation**: Validación de modelos

### Frontend
- **Angular 17+**: Framework principal de desarrollo
- **TypeScript**: Lenguaje de programación
- **Angular Material**: Biblioteca de componentes UI
- **RxJS**: Manejo de operaciones asíncronas
- **Angular CLI**: Herramientas de desarrollo

### Herramientas de Desarrollo
- **Visual Studio 2022** o **VS Code**: IDEs de desarrollo
- **SQL Server Management Studio**: Gestión de base de datos
- **Postman**: Testing de APIs
- **Git**: Control de versiones

---

## Arquitectura del Sistema

### Patrón Arquitectónico
```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   Angular SPA   │ ←──────────────→ │  .NET 8 Web API │
│   (Frontend)    │                  │    (Backend)    │
└─────────────────┘                  └─────────────────┘
                                              │
                                              │ Entity Framework
                                              │ Core
                                              ▼
                                     ┌─────────────────┐
                                     │   SQL Server    │
                                     │   (Database)    │
                                     └─────────────────┘
```

### Estructura de Capas - Backend (.NET 8)

```
TaskFlow.API/
├── Controllers/           # Controladores de la API
├── Models/               # DTOs y ViewModels
├── Services/             # Lógica de negocio
├── Data/                 # Contexto y configuración de EF
├── Entities/             # Entidades de base de datos
├── Middlewares/          # Middlewares personalizados
├── Extensions/           # Métodos de extensión
└── Program.cs           # Punto de entrada
```

### Estructura del Proyecto - Frontend (Angular)

```
taskflow-frontend/
├── src/
│   ├── app/
│   │   ├── core/              # Servicios singleton y guards
│   │   ├── shared/            # Componentes y servicios compartidos
│   │   ├── features/          # Módulos por funcionalidad
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   ├── boards/        # Gestión de tableros
│   │   │   ├── lists/         # Gestión de listas
│   │   │   └── cards/         # Gestión de tarjetas
│   │   ├── models/            # Interfaces y modelos
│   │   └── interceptors/      # Interceptors HTTP
│   ├── assets/               # Recursos estáticos
│   └── environments/         # Configuraciones de entorno
```

---

## Diseño de Base de Datos

### Esquema de Entidades

```sql
-- Tabla Users
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- Tabla Boards
CREATE TABLE Boards (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    OwnerId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (OwnerId) REFERENCES Users(Id)
);

-- Tabla BoardMembers (Relación muchos a muchos)
CREATE TABLE BoardMembers (
    BoardId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    JoinedAt DATETIME2 DEFAULT GETDATE(),
    PRIMARY KEY (BoardId, UserId),
    FOREIGN KEY (BoardId) REFERENCES Boards(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Tabla Lists
CREATE TABLE Lists (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(200) NOT NULL,
    BoardId UNIQUEIDENTIFIER NOT NULL,
    Position INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (BoardId) REFERENCES Boards(Id) ON DELETE CASCADE
);

-- Tabla Cards
CREATE TABLE Cards (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(300) NOT NULL,
    Description NVARCHAR(1000),
    ListId UNIQUEIDENTIFIER NOT NULL,
    Position INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (ListId) REFERENCES Lists(Id) ON DELETE CASCADE
);

-- Tabla CardAssignments (Relación muchos a muchos)
CREATE TABLE CardAssignments (
    CardId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    AssignedAt DATETIME2 DEFAULT GETDATE(),
    PRIMARY KEY (CardId, UserId),
    FOREIGN KEY (CardId) REFERENCES Cards(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
```

### Diagrama de Relaciones

```
Users (1) ──────────── (*) Boards
  │                        │
  │                        │
  │ (*)              (*) Lists
  │                        │
  │                        │
  └── CardAssignments ── Cards
           (*)          (*)
```

---

## APIs y Endpoints

### Autenticación
```
POST   /api/auth/register        # Registro de usuario
POST   /api/auth/login           # Inicio de sesión
POST   /api/auth/refresh         # Renovar token
```

### Usuarios
```
GET    /api/users/profile        # Obtener perfil actual
PUT    /api/users/profile        # Actualizar perfil
GET    /api/users/search         # Buscar usuarios por email
```

### Tableros
```
GET    /api/boards               # Obtener tableros del usuario
POST   /api/boards               # Crear nuevo tablero
GET    /api/boards/{id}          # Obtener tablero específico
PUT    /api/boards/{id}          # Actualizar tablero
DELETE /api/boards/{id}          # Eliminar tablero
POST   /api/boards/{id}/members  # Agregar miembro al tablero
DELETE /api/boards/{id}/members/{userId}  # Remover miembro
```

### Listas
```
GET    /api/boards/{id}/lists    # Obtener listas del tablero
POST   /api/boards/{id}/lists    # Crear nueva lista
PUT    /api/lists/{id}           # Actualizar lista
DELETE /api/lists/{id}           # Eliminar lista
PUT    /api/lists/{id}/position  # Actualizar posición
```

### Tarjetas
```
GET    /api/lists/{id}/cards     # Obtener tarjetas de la lista
POST   /api/lists/{id}/cards     # Crear nueva tarjeta
PUT    /api/cards/{id}           # Actualizar tarjeta
DELETE /api/cards/{id}           # Eliminar tarjeta
PUT    /api/cards/{id}/move      # Mover tarjeta
POST   /api/cards/{id}/assign    # Asignar usuario
DELETE /api/cards/{id}/assign/{userId}  # Des-asignar usuario
```

---

## Modelos de Datos (DTOs)

### Backend (.NET 8)

```csharp
// User DTOs
public class UserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
}

public class RegisterDto
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
}

public class LoginDto
{
    public string Email { get; set; }
    public string Password { get; set; }
}

// Board DTOs
public class BoardDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public UserDto Owner { get; set; }
    public List<UserDto> Members { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateBoardDto
{
    public string Name { get; set; }
    public string Description { get; set; }
}

// List DTOs
public class ListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public int Position { get; set; }
    public List<CardDto> Cards { get; set; }
}

// Card DTOs
public class CardDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public int Position { get; set; }
    public List<UserDto> AssignedUsers { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### Frontend (Angular/TypeScript)

```typescript
// User Models
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Board Models
export interface Board {
  id: string;
  name: string;
  description?: string;
  owner: User;
  members: User[];
  createdAt: Date;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
}

// List Models
export interface List {
  id: string;
  name: string;
  position: number;
  cards: Card[];
}

// Card Models
export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  assignedUsers: User[];
  createdAt: Date;
}

export interface MoveCardRequest {
  listId: string;
  position: number;
}
```

---

## Configuración del Proyecto

### Backend - Program.cs

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TaskFlow.API.Data;
using TaskFlow.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<TaskFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                builder.Configuration["JWT:Key"])),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBoardService, BoardService>();
builder.Services.AddScoped<IListService, ListService>();
builder.Services.AddScoped<ICardService, CardService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### Frontend - Angular Service Example

```typescript
// board.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board, CreateBoardRequest } from '../models/board.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private apiUrl = 'https://localhost:7000/api/boards';

  constructor(private http: HttpClient) {}

  getBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(this.apiUrl);
  }

  getBoardById(id: string): Observable<Board> {
    return this.http.get<Board>(`${this.apiUrl}/${id}`);
  }

  createBoard(board: CreateBoardRequest): Observable<Board> {
    return this.http.post<Board>(this.apiUrl, board);
  }

  updateBoard(id: string, board: CreateBoardRequest): Observable<Board> {
    return this.http.put<Board>(`${this.apiUrl}/${id}`, board);
  }

  deleteBoard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

---

## Configuración de Entorno

### appsettings.json (Backend)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=TaskFlowDB;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true"
  },
  "JWT": {
    "Key": "TaskFlow_Super_Secret_Key_For_Demo_2025",
    "Issuer": "TaskFlowAPI",
    "Audience": "TaskFlowClient"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### environment.ts (Frontend)

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7000/api',
  appName: 'TaskFlow Demo'
};
```

---

## Seguridad

### Autenticación JWT
- **Tokens de acceso**: Válidos por 24 horas
- **Refresh tokens**: Válidos por 7 días
- **Encriptación**: SHA256 para contraseñas
- **CORS**: Configurado solo para localhost:4200

### Validaciones
- **Backend**: FluentValidation para DTOs
- **Frontend**: Angular Reactive Forms con validaciones
- **Base de datos**: Restricciones de integridad referencial

---

## Pasos de Implementación

### Fase 1: Backend Basic Setup
1. Crear proyecto .NET 8 Web API
2. Configurar Entity Framework Core
3. Crear modelos y DbContext
4. Implementar autenticación JWT
5. Crear controladores básicos

### Fase 2: Frontend Basic Setup
1. Crear proyecto Angular
2. Configurar Angular Material
3. Implementar autenticación
4. Crear servicios HTTP
5. Desarrollar componentes básicos

### Fase 3: Funcionalidades Core
1. CRUD de tableros
2. CRUD de listas
3. CRUD de tarjetas
4. Drag & Drop funcionalidad
5. Asignación de usuarios

### Fase 4: Mejoras y Testing
1. Validaciones avanzadas
2. Manejo de errores
3. Testing unitario
4. Optimizaciones de rendimiento

---

## Comandos de Inicio Rápido

### Backend
```bash
# Crear proyecto
dotnet new webapi -n TaskFlow.API
cd TaskFlow.API

# Agregar paquetes
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add package FluentValidation.AspNetCore

# Crear base de datos
dotnet ef migrations add InitialCreate
dotnet ef database update

# Ejecutar proyecto
dotnet run
```

### Frontend
```bash
# Crear proyecto
ng new taskflow-frontend
cd taskflow-frontend

# Agregar Angular Material
ng add @angular/material

# Agregar dependencias
npm install @angular/cdk

# Servir aplicación
ng serve
```

---

## Testing

### Backend Testing
- **Unit Tests**: xUnit para lógica de negocio
- **Integration Tests**: Testing de controladores
- **Database Tests**: In-Memory database para testing

### Frontend Testing
- **Unit Tests**: Jasmine y Karma
- **E2E Tests**: Cypress para testing end-to-end
- **Component Testing**: Angular Testing Utilities

---

## Consideraciones de Performance

### Backend
- **Lazy Loading**: Para relaciones de Entity Framework
- **Paginación**: Para listas grandes de datos
- **Caching**: Para datos frecuentemente accedidos
- **Async/Await**: Para operaciones no bloqueantes

### Frontend
- **OnPush Strategy**: Para optimizar change detection
- **Lazy Loading**: Para módulos de funcionalidades
- **Virtual Scrolling**: Para listas grandes
- **Service Workers**: Para caching offline

---

## Próximos Pasos para Producción

1. **Containerización**: Docker para deployment
2. **CI/CD**: Azure DevOps o GitHub Actions
3. **Hosting**: Azure App Service o IIS
4. **Monitoring**: Application Insights
5. **Security**: HTTPS, Rate Limiting, Input Validation
6. **Backup**: Estrategia de respaldo de base de datos

---

*Documento técnico generado el 24 de julio de 2025*
*Versión: 1.0 - Demo/Prototipo*
