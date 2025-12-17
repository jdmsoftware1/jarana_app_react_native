# 📱 CONTEXT PROMPT - App Móvil Registro Horario

> **IMPORTANTE:** Este archivo contiene el contexto completo de la aplicación móvil React Native. Debe actualizarse cada vez que se realicen cambios significativos.

---

## 🎯 Descripción General

Aplicación móvil React Native (Expo) para el sistema de registro horario de empleados. Conecta con el backend en `https://jarana-horas-back.onrender.com`.

### Repositorios
- **App Móvil:** `jarana_app_react_native`
- **Backend + Web:** `jarana_horas_back_front`

---

## 🔐 Autenticación

### Google OAuth 2.0
- Flujo OAuth completo con deep linking
- Scheme: `registrohorario://` (standalone) o `exp://` (Expo Go)
- El backend detecta `mobile=true` y `redirect_uri` para redirigir correctamente
- Token JWT guardado en AsyncStorage

### Roles
- **Admin:** Acceso completo a gestión
- **Empleado:** Acceso limitado a sus propios datos

---

## 📱 Estructura de Navegación

### Empleado (EmployeeNavigator) - 6 Tabs
| Tab | Pantalla | Descripción | Endpoint Backend |
|-----|----------|-------------|------------------|
| **Calendario** | CalendarScreen | Ver horarios y ausencias. Al pulsar día muestra horario | `GET /weekly-schedules/employee/:id/year/:year`, `GET /vacations/employee/:id` |
| **Fichar** | CheckInOutScreen | Entrada/salida con formato fecha dd/mm/AAAA | `POST /records/checkin`, `POST /records/checkout` |
| **Ausencia** | RequestAbsenceScreen | Solicitar vacaciones, bajas médicas, etc. | `POST /vacations`, `GET /absence-categories/active` |
| **Horario** | MyScheduleScreen | Ver horario semanal (semana ISO 8601) | `GET /weekly-schedules/employee/:id/week/:year/:week` |
| **Docs** | DocumentsScreen | Descargar nóminas/contratos, subir documentos | `GET /documents/my-documents`, `POST /documents/upload` |
| **Perfil** | ProfileScreen | Info usuario, fecha alta, cerrar sesión | - |

### Admin (AdminNavigator) - 5 Tabs
| Tab | Pantalla | Descripción |
|-----|----------|-------------|
| **Dashboard** | AdminDashboardScreen | Métricas y resumen general |
| **Empleados** | EmployeesScreen | CRUD de empleados |
| **Registros** | RecordsScreen | Ver todos los fichajes |
| **Horarios** | SchedulesScreen | Gestión de horarios semanales (filtro por semana, horarios partidos) |
| **Ausencias** | AbsencesScreen | Ver/aprobar vacaciones y bajas de empleados |

> ⚠️ **NO incluir Insight IA en la app móvil**

---

## 🔧 Configuración Multi-tenant

### Tabla `tenants` en Neon PostgreSQL
```sql
CREATE TABLE tenants (
  email VARCHAR(255) PRIMARY KEY,
  role VARCHAR(50),           -- 'Admin' o 'Employee'
  enterprise_name VARCHAR(255),
  api_url VARCHAR(255),
  theme VARCHAR(50)
);
```

### Flujo de autenticación
1. Usuario hace login con Google OAuth
2. Backend devuelve token JWT
3. App consulta `/api/tenant?email=...` para obtener rol del tenant
4. Rol se normaliza a minúsculas (`Admin` → `admin`)
5. Se muestra AdminNavigator o EmployeeNavigator según rol

### Archivos relevantes
- `src/services/tenantService.js` - Consulta y cache de tenant
- `src/context/AuthContext.js` - Gestión de autenticación y rol

---

## 🔔 Sistema de Notificaciones Push

### Tecnología
- **Firebase Cloud Messaging (FCM)** - Gratuito, funciona en Android e iOS
- **expo-notifications** - Integración con Expo

### Tipos de notificaciones
| Tipo | Trigger | Mensaje |
|------|---------|---------|
| `check_in_reminder` | Cron job (2 min después de hora entrada) | "⏰ ¡No olvides fichar!" |
| `schedule_assigned` | Admin asigna horario | "📅 Nuevo horario asignado" |
| `document_pending` | Admin sube documento | "📄 Nuevo documento disponible" |
| `absence_status` | Admin aprueba/rechaza ausencia | "✅ Solicitud aprobada" |
| `shift_ending` | 5 min antes de fin de turno | "🔔 Tu turno termina pronto" |

### Endpoints de notificaciones
```
POST /api/notifications/register-token    # Registrar token FCM
POST /api/notifications/unregister-token  # Desactivar token (logout)
GET  /api/notifications                   # Obtener notificaciones
GET  /api/notifications/unread-count      # Contar no leídas
PUT  /api/notifications/:id/read          # Marcar como leída
PUT  /api/notifications/read-all          # Marcar todas como leídas
POST /api/notifications/send              # Enviar notificación (admin)
POST /api/notifications/send-bulk         # Enviar a múltiples (admin)
```

### Archivos relevantes
- `src/services/notificationService.js` - Cliente de notificaciones (app)
- Backend: `src/services/notificationService.js` - Lógica FCM
- Backend: `src/routes/notifications.js` - Endpoints API
- Backend: `src/models/PushToken.js` - Modelo de tokens
- Backend: `src/models/Notification.js` - Historial de notificaciones

### Configuración requerida
- **Render (backend):** Variable `FIREBASE_SERVICE_ACCOUNT` con JSON del Service Account
- **App:** Plugin `expo-notifications` en `app.json`

---

## 🗄️ Endpoints Backend Relevantes

### Autenticación
```
GET  /auth/google?mobile=true&redirect_uri=<expo_url>
GET  /auth/google/callback
POST /auth/verify-token
```

### Registros (Fichajes)
```
GET  /records                     # Todos los registros (admin)
GET  /records/my                  # Mis registros (empleado)
POST /records/checkin             # Fichar entrada
POST /records/checkout            # Fichar salida
GET  /records/status              # Estado actual
```

### Empleados
```
GET    /employees                 # Lista todos
GET    /employees/:id             # Detalle
POST   /employees                 # Crear
PUT    /employees/:id             # Actualizar
PATCH  /employees/:id/toggle-active
```

### Horarios Semanales
```
GET  /weekly-schedules/employee/:id                    # Todos los horarios
GET  /weekly-schedules/employee/:id/year/:year         # Por año
GET  /weekly-schedules/employee/:id/week/:year/:week   # Semana específica
POST /weekly-schedules                                 # Crear/actualizar
GET  /weekly-schedules/employee/:id/calendar/:year     # Vista calendario
```

### Vacaciones/Ausencias
```
GET  /vacations                          # Todas (admin)
GET  /vacations/employee/:id             # Por empleado
POST /vacations                          # Crear solicitud
PUT  /vacations/:id/status               # Aprobar/rechazar
DELETE /vacations/:id                    # Eliminar (solo pending)
GET  /vacations/check/:employeeId/:date  # Verificar si está de vacaciones
```

### Categorías de Ausencia
```
GET /absence-categories/active    # Categorías activas (para empleados)
GET /absence-categories           # Todas (autenticado)
```

**Tipos de ausencia disponibles:**
- Vacaciones
- Baja médica
- Asuntos propios
- Permiso retribuido
- Permiso no retribuido
- Maternidad/Paternidad
- Otros

---

## 📁 Estructura de Archivos

```
src/
├── config/
│   └── api.js                    # URL del backend
├── context/
│   └── AuthContext.js            # Autenticación y usuario
├── services/
│   └── apiService.js             # Servicios API
├── navigation/
│   ├── AppNavigator.js           # Navegador principal
│   ├── AdminNavigator.js         # Tabs admin (5 tabs)
│   └── EmployeeNavigator.js      # Tabs empleado (4 tabs)
├── screens/
│   ├── auth/
│   │   └── GoogleLoginScreen.js  # Login OAuth
│   ├── admin/
│   │   ├── AdminDashboardScreen.js
│   │   ├── EmployeesScreen.js
│   │   ├── RecordsScreen.js
│   │   ├── SchedulesScreen.js    # Con filtro por semana
│   │   └── AbsencesScreen.js     # Gestión de ausencias
│   └── employee/
│       ├── CalendarScreen.js     # Calendario con ausencias
│       ├── CheckInOutScreen.js   # Fichar
│       ├── RequestAbsenceScreen.js # Solicitar ausencia
│       └── MyScheduleScreen.js   # Ver horario semanal
├── components/
│   └── ...
├── theme/
│   ├── colors.js
│   └── theme.js
└── utils/
    └── dateUtils.js
```

---

## 🎨 Tema y Colores

```javascript
// Brand
brandLight:  '#8B7355'
brandMedium: '#6B5744'
brandDark:   '#4A3C2F'
brandCream:  '#F5F1E8'

// Status
success: '#10B981'
error:   '#EF4444'
warning: '#F59E0B'
info:    '#3B82F6'
```

---

## ⚙️ Variables de Entorno (.env)

```env
# Producción
EXPO_PUBLIC_API_URL=https://jarana-horas-back.onrender.com
EXPO_PUBLIC_ENVIRONMENT=PRO

# Desarrollo
EXPO_PUBLIC_API_URL=http://192.168.31.164:3000
EXPO_PUBLIC_ENVIRONMENT=DEV
EXPO_PUBLIC_DEV_ROLE=admin  # o employee

# Features
EXPO_PUBLIC_ENABLE_GOOGLE_AUTH=true
EXPO_PUBLIC_ENABLE_2FA=true
```

---

## 🔄 Diferencias Admin vs Empleado

| Funcionalidad | Admin | Empleado |
|---------------|-------|----------|
| Ver todos los empleados | ✅ | ❌ |
| Ver todos los registros | ✅ | Solo los suyos |
| Ver todos los horarios | ✅ (filtro por semana) | Solo el suyo |
| Aprobar ausencias | ✅ | ❌ |
| Solicitar ausencias | ❌ | ✅ |
| Ver calendario personal | ❌ | ✅ |
| Fichar | ❌ | ✅ |
| Insight IA | ❌ (no en app) | ❌ |

---

## 📝 Notas Importantes

1. **Horarios semanales:** 
   - Backend usa `dayOfWeek`: 0=Lunes, 1=Martes, ..., 6=Domingo
   - Cálculo de semana ISO 8601 (semana empieza en lunes)
   - Soporta horarios partidos (`isSplitSchedule`): mañana y tarde
   - Campos pueden venir en snake_case o camelCase

2. **Ausencias:** Incluyen vacaciones, bajas médicas y otros tipos. Cada tipo tiene una categoría con propiedades como `requiresApproval`, `isPaid`, `maxDaysPerYear`.

3. **Calendario empleado:** Muestra horarios y ausencias. Al pulsar un día con horario asignado, muestra el detalle del horario de ese día.

4. **OAuth móvil:** Usa `Linking.createURL()` para generar la URL de callback correcta según el entorno (Expo Go vs standalone).

5. **Tunnel para desarrollo:** Usar `npx expo start --tunnel` para que el backend de Render pueda redirigir correctamente.

6. **Multi-tenant:** El rol se obtiene de la tabla `tenants` en Neon, no del backend. Se normaliza a minúsculas para comparación.

7. **Android UI:** Usar `useSafeAreaInsets` y `Platform` para ajustar la barra de navegación y evitar solapamiento con botones del sistema.

---

## 📅 Última Actualización

**Fecha:** Diciembre 2025  
**Versión:** 1.3.0  
**Estado:** Multi-tenant funcionando, 6 tabs empleado, horarios corregidos

---

## 🔗 Documentos Relacionados

- `README.md` - Documentación general
- `UPDATES.md` - Historial de actualizaciones
- `RESUMEN_IMPLEMENTACION.md` - Estado de implementación
