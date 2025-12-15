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

### Empleado (EmployeeNavigator) - 4 Tabs
| Tab | Pantalla | Descripción | Endpoint Backend |
|-----|----------|-------------|------------------|
| **Calendario** | CalendarScreen | Ver días libres, vacaciones, ausencias aprobadas | `GET /vacations/employee/:id` |
| **Fichar** | CheckInOutScreen | Entrada/salida con un toque | `POST /records/checkin`, `POST /records/checkout` |
| **Solicitar Ausencia** | RequestAbsenceScreen | Solicitar vacaciones, bajas médicas, etc. | `POST /vacations`, `GET /absence-categories/active` |
| **Horario** | MyScheduleScreen | Ver horario semanal asignado | `GET /weekly-schedules/employee/:id/week/:year/:week` |

### Admin (AdminNavigator) - 5 Tabs
| Tab | Pantalla | Descripción |
|-----|----------|-------------|
| **Dashboard** | AdminDashboardScreen | Métricas y resumen general |
| **Empleados** | EmployeesScreen | CRUD de empleados |
| **Registros** | RecordsScreen | Ver todos los fichajes |
| **Horarios** | SchedulesScreen | Gestión de horarios semanales (filtro por semana) |
| **Ausencias** | AbsencesScreen | Ver/aprobar vacaciones y bajas de empleados |

> ⚠️ **NO incluir Insight IA en la app móvil**

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

1. **Horarios semanales:** Los empleados tienen horarios asignados por semana (año + número de semana). El admin debe poder filtrar por semana.

2. **Ausencias:** Incluyen vacaciones, bajas médicas y otros tipos. Cada tipo tiene una categoría con propiedades como `requiresApproval`, `isPaid`, `maxDaysPerYear`.

3. **Calendario empleado:** Muestra días libres, vacaciones aprobadas y ausencias. No es para gestionar, solo para visualizar.

4. **OAuth móvil:** Usa `Linking.createURL()` para generar la URL de callback correcta según el entorno (Expo Go vs standalone).

5. **Tunnel para desarrollo:** Usar `npx expo start --tunnel` para que el backend de Render pueda redirigir correctamente.

---

## 📅 Última Actualización

**Fecha:** Diciembre 2025  
**Versión:** 1.1.0  
**Estado:** OAuth funcionando, pendiente ajustar menús

---

## 🔗 Documentos Relacionados

- `README.md` - Documentación general
- `UPDATES.md` - Historial de actualizaciones
- `RESUMEN_IMPLEMENTACION.md` - Estado de implementación
