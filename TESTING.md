# Testing Guide - Eisential Backend

## 🧪 Configuración de Pruebas

Este proyecto backend utiliza **Jest** para pruebas unitarias de las API routes de Next.js.

## 📦 Dependencias Instaladas

```json
{
  "@testing-library/jest-dom": "^6.1.5",
  "@testing-library/react": "^14.1.2",
  "@types/jest": "^29.5.11",
  "jest": "^29.7.0",
  "jest-environment-jsdom": "^29.7.0"
}
```

## 🚀 Comandos Disponibles

### Ejecutar pruebas en modo watch (desarrollo)
```bash
npm test
```

### Ejecutar pruebas con reporte de cobertura
```bash
npm run test:coverage
```

### Ejecutar pruebas en modo CI (para SonarQube)
```bash
npm run test:ci
```

## 📊 Objetivos de Cobertura

El proyecto está configurado con los siguientes umbrales de cobertura:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## 📁 Estructura de Pruebas

```
src/
└── app/
    └── api/
        ├── task/
        │   ├── __tests__/
        │   │   └── route.test.ts          ✅ GET, POST
        │   ├── route.ts
        │   └── [taskId]/
        │       ├── __tests__/
        │       │   └── route.test.ts      ✅ PATCH, DELETE
        │       └── route.ts
        └── category/
            ├── __tests__/
            │   └── route.test.ts          ✅ GET, POST
            └── route.ts
```

## ✅ Pruebas Creadas

### Task API Routes (`/api/task`)

**GET /api/task**
- ✅ Devuelve 401 si no está autenticado
- ✅ Devuelve todas las tareas del usuario autenticado
- ✅ Maneja errores de base de datos

**POST /api/task**
- ✅ Devuelve 401 si no está autenticado
- ✅ Devuelve 400 si falta el título
- ✅ Crea una nueva tarea exitosamente
- ✅ Maneja errores de base de datos

### Task Update/Delete Routes (`/api/task/[taskId]`)

**PATCH /api/task/[taskId]**
- ✅ Devuelve 401 si no está autenticado
- ✅ Devuelve 404 si la tarea no pertenece al usuario
- ✅ Actualiza tarea exitosamente
- ✅ Maneja actualizaciones de cuadrante (drag & drop)
- ✅ Maneja errores de base de datos

**DELETE /api/task/[taskId]**
- ✅ Devuelve 401 si no está autenticado
- ✅ Devuelve 404 si la tarea no existe o no pertenece al usuario
- ✅ Elimina tarea exitosamente
- ✅ Maneja errores de base de datos

### Category API Routes (`/api/category`)

**GET /api/category**
- ✅ Devuelve 401 si no está autenticado
- ✅ Devuelve todas las categorías del usuario autenticado
- ✅ Maneja errores de base de datos

**POST /api/category**
- ✅ Devuelve 401 si no está autenticado
- ✅ Devuelve 400 si falta el nombre
- ✅ Crea una nueva categoría exitosamente
- ✅ Crea categoría sin color (opcional)
- ✅ Maneja errores de base de datos

## 🔧 Configuración de SonarQube

El archivo `sonar-project.properties` está configurado para:

1. **Reportar cobertura**: Lee el archivo `coverage/lcov.info`
2. **Excluir archivos de prueba**: No analiza archivos `.test.ts`
3. **Excluir Prisma**: Ignora `src/prisma/**`

### Ejecutar análisis de SonarQube

```bash
# 1. Ejecutar pruebas con cobertura
npm run test:ci

# 2. Ejecutar análisis de SonarQube
sonar-scanner
```

## 📝 Ejemplo de Prueba

```typescript
import { GET } from '../route';
import { prisma } from '@/src/lib/prisma';
import { getSession } from '@/src/lib/auth';

jest.mock('@/src/lib/prisma');
jest.mock('@/src/lib/auth');

describe('Task API Routes', () => {
  it('should return all tasks for authenticated user', async () => {
    const mockSession = {
      user: { id: 'user-123', name: 'Test', email: 'test@example.com' },
    };
    
    mockGetSession.mockResolvedValue(mockSession);
    mockPrisma.task.findMany.mockResolvedValue([/* tasks */]);

    const response = await GET();
    
    expect(response.status).toBe(200);
  });
});
```

## 🎯 Cobertura de Funcionalidades

Las pruebas cubren:

- ✅ **Autenticación**: Verificación de sesión en todas las rutas
- ✅ **Autorización**: Verificación de propiedad de recursos
- ✅ **Validación**: Campos requeridos y formatos
- ✅ **CRUD Completo**: Crear, leer, actualizar, eliminar
- ✅ **Manejo de Errores**: Errores de DB, recursos no encontrados
- ✅ **Edge Cases**: Valores nulos, opcionales, etc.

## 🔍 Mocks Configurados

El archivo `jest.setup.js` incluye mocks para:

- ✅ `next/navigation`: useRouter, usePathname, useSearchParams
- ✅ `next-auth/react`: useSession, SessionProvider
- ✅ `@/src/lib/prisma`: Todos los modelos de Prisma (User, Task, Category)

## 🚀 Próximos Pasos

Para agregar más pruebas:

1. Crear pruebas para rutas de autenticación (`/api/auth`)
2. Agregar pruebas de integración end-to-end
3. Agregar pruebas para validaciones de schema de Prisma

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [Next.js API Testing](https://nextjs.org/docs/app/building-your-application/testing)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
