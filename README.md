# Eisential Backend API

Backend API para Eisential - Sistema de gestión de tareas basado en la Matriz de Eisenhower.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v4
- **Testing**: Jest + Testing Library
- **Code Quality**: SonarQube

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- PostgreSQL database (recomendado: [Neon](https://neon.tech/))
- Credenciales OAuth para Google y/o GitHub

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd Eisential-back
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Database (obtén de Neon o tu instancia PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth Secret (genera uno con: openssl rand -base64 32)
NEXTAUTH_SECRET="tu-secret-key-super-segura"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"
GITHUB_CLIENT_ID="tu-github-client-id"
GITHUB_CLIENT_SECRET="tu-github-client-secret"

# Frontend URL
FRONTEND_URL="http://localhost:3001"
```

#### Cómo obtener credenciales OAuth:

**Google OAuth:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Configura URIs autorizadas:
   - `http://localhost:3000`
   - `http://localhost:3000/api/auth/callback/google`

**GitHub OAuth:**
1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Crea una nueva OAuth App
3. Configura:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### 4. Configurar la base de datos

```bash
# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Abrir Prisma Studio para ver la BD
npx prisma studio
```

### 5. Ejecutar el servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 🧪 Testing

Este proyecto incluye un conjunto completo de tests unitarios.

### Ejecutar tests

```bash
# Modo watch (desarrollo)
npm test

# Ejecución única con cobertura
npm run test:coverage

# Modo CI (para integración continua)
npm run test:ci
```

### Cobertura de Tests

El proyecto mantiene los siguientes umbrales de cobertura:
- Branches: 80%
- Functions: 80%  
- Lines: 80%
- Statements: 80%

Para más detalles, consulta [TESTING.md](./TESTING.md)

## 📁 Estructura del Proyecto

```
Eisential-back/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── category/      # Category CRUD
│   │   │   │   └── __tests__/ # ✅ Tests unitarios
│   │   │   ├── task/          # Task CRUD
│   │   │   │   ├── __tests__/ # ✅ Tests unitarios
│   │   │   │   └── [taskId]/  # Task operations
│   │   │   │       └── __tests__/ # ✅ Tests unitarios
│   │   │   └── oauth/         # OAuth callbacks
│   │   └── auth/              # Auth pages
│   ├── lib/
│   │   ├── auth.ts           # NextAuth configuration
│   │   └── prisma.ts         # Prisma client
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── middleware.ts         # CORS & Auth middleware
├── jest.config.js            # Jest configuration
├── jest.setup.js             # Test setup & mocks
├── .env.example              # Example environment variables
└── TESTING.md                # Guía de testing detallada
```

## 🔌 API Endpoints

### Authentication
- `GET /api/auth/session` - Obtener sesión actual
- `POST /api/auth/signin` - Iniciar sesión
- `POST /api/auth/signout` - Cerrar sesión
- `GET /api/auth/callback/[provider]` - OAuth callbacks

### Tasks
- `GET /api/task` - Listar todas las tareas del usuario
- `POST /api/task` - Crear nueva tarea
- `PATCH /api/task/[taskId]` - Actualizar tarea
- `DELETE /api/task/[taskId]` - Eliminar tarea

### Categories
- `GET /api/category` - Listar categorías del usuario
- `POST /api/category` - Crear nueva categoría
- `DELETE /api/category/[categoryId]` - Eliminar categoría

## 🔒 Autenticación

El proyecto usa NextAuth.js con los siguientes providers:
- Google OAuth
- GitHub OAuth

Todas las rutas de API están protegidas y requieren autenticación excepto las rutas de `/api/auth/*`.

## 🗄️ Base de Datos

### Schema Principal

**User** - Usuarios autenticados
- id, name, email, image
- Relaciones: accounts, sessions, categories, tasks

**Task** - Tareas del usuario
- id, title, description, quadrant, completed, dueDate
- Relaciones: user, category

**Category** - Categorías personalizadas
- id, name, color
- Relaciones: user, tasks

**Account & Session** - Tablas de NextAuth para OAuth

### Migraciones

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Reset database (⚠️ borra todos los datos)
npx prisma migrate reset
```

## 📊 SonarQube

El proyecto está configurado para análisis de calidad de código con SonarQube.

```bash
# Ejecutar análisis
npm run test:ci
sonar-scanner
```

Configuración en `sonar-project.properties`

## 🚢 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio en [Vercel](https://vercel.com)
2. Configura las variables de entorno en el dashboard
3. Deploy automático en cada push a main

### Variables de entorno en producción

Asegúrate de configurar todas las variables del `.env.example` en tu plataforma de deployment.

## 🤝 Contribuir

1. Crea un feature branch (`git checkout -b feature/amazing-feature`)
2. Commit tus cambios (`git commit -m 'Add amazing feature'`)
3. Asegúrate de que los tests pasen (`npm test`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm start` - Inicia servidor de producción
- `npm test` - Ejecuta tests en modo watch
- `npm run test:coverage` - Tests con reporte de cobertura
- `npm run test:ci` - Tests para CI/CD

## 🐛 Troubleshooting

### Error: "NEXTAUTH_SECRET no está definido"
- Asegúrate de tener el archivo `.env` con `NEXTAUTH_SECRET` configurado
- Genera uno nuevo: `openssl rand -base64 32`

### Error de conexión a base de datos
- Verifica que `DATABASE_URL` y `DIRECT_URL` sean correctos
- Asegúrate de que tu IP esté en la whitelist de Neon
- Ejecuta `npx prisma generate` después de cambiar el schema

### Tests fallan
- Ejecuta `npm install` para asegurar que todas las dependencias estén instaladas
- Verifica que no haya conflictos con puertos (3000, 3001)

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

Desarrollado por el equipo de Eisential

---

Para más información sobre testing, consulta [TESTING.md](./TESTING.md)
