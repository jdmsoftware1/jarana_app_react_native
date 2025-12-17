# 📋 UPDATES - Historial de Actualizaciones

> Este archivo documenta todas las actualizaciones y cambios pendientes de la aplicación móvil.

---

## 🔄 Actualización v1.3.0 - Diciembre 2025

### ✅ Completado

#### Sistema Multi-tenant
- [x] Integración con tabla `tenants` en Neon PostgreSQL
- [x] Rol del usuario se obtiene de Neon (Admin/Employee)
- [x] Cache de tenant con limpieza automática en cada login
- [x] URL del tenant service: `https://aliadadigital-back-front.onrender.com/api`

#### Menú Empleado (Ampliado a 6 tabs)
- [x] **Calendario** - Ver horarios y ausencias. Al pulsar un día muestra el horario de ese día
- [x] **Fichar** - Entrada/salida con formato fecha español (dd/mm/AAAA)
- [x] **Ausencia** - Solicitar vacaciones, bajas médicas, etc.
- [x] **Horario** - Ver horario semanal con plantilla asignada
- [x] **Docs** - Documentos: descargar nóminas/contratos y subir documentos para aprobación
- [x] **Perfil** - Info del usuario, fecha de alta y cerrar sesión

#### Correcciones de Horarios
- [x] Cálculo correcto de semana ISO 8601
- [x] Mapeo de días: Backend usa 0=Lunes, 1=Martes, ..., 6=Domingo
- [x] Soporte para campos snake_case y camelCase del backend
- [x] Visualización correcta de horarios partidos (mañana/tarde)
- [x] Fallback con index cuando `dayOfWeek` es undefined

#### UI/UX Android
- [x] Safe area insets para evitar solapamiento con botones de navegación Android
- [x] Ajuste de `tabBarStyle` con `paddingBottom` y `height` dinámicos

#### Sistema de Notificaciones Push (Firebase Cloud Messaging)
- [x] Integración con Firebase Admin SDK en backend
- [x] Modelo `PushToken` para almacenar tokens de dispositivos
- [x] Modelo `Notification` para historial de notificaciones
- [x] Servicio `notificationService` en backend y app móvil
- [x] Registro automático de token en login, desregistro en logout
- [x] Triggers automáticos:
  - 📅 Nuevo horario asignado (cuando admin asigna plantilla)
  - 📄 Nuevo documento disponible (cuando admin sube documento)
  - ✅/❌ Ausencia aprobada/rechazada (cuando admin cambia estado)

---

## 🔄 Actualización v1.2.0 - Diciembre 2025

### ✅ Completado

#### OAuth Google Móvil
- [x] Implementar flujo OAuth con deep linking
- [x] Configurar scheme `registrohorario://` en app.json
- [x] Backend detecta `mobile=true` y `redirect_uri`
- [x] Redirección correcta desde Render a Expo Go
- [x] Actualizar SDK de Expo 51 → 54

#### Menú Empleado (Base 4 tabs)
- [x] **Calendario** - `CalendarScreen.js` - Ver días libres, vacaciones y ausencias aprobadas
- [x] **Fichar** - `CheckInOutScreen.js` - Entrada/salida
- [x] **Solicitar Ausencia** - `RequestAbsenceScreen.js` - Solicitar vacaciones, bajas médicas, etc.
- [x] **Horario** - `MyScheduleScreen.js` - Ver horario semanal

#### Menú Admin (Actualizado)
- [x] **Quitar Insight IA** - Eliminado del AdminNavigator
- [x] **Añadir Ausencias** - `AbsencesScreen.js` - Ver/aprobar vacaciones y bajas
- [x] **Arreglar Horarios** - `SchedulesScreen.js` - Filtro por semana (año + número de semana)

#### Servicios API
- [x] `absenceCategoryService` - Obtener categorías de ausencias
- [x] `vacationService.getByEmployee()` - Obtener ausencias por empleado
- [x] `weeklyScheduleService.getByEmployeeWeek()` - Obtener horario por semana

---

## 📝 Detalles de Implementación

### Calendario Empleado (Nueva)
```
Endpoint: GET /vacations/employee/:id
Mostrar:
- Días libres (del horario semanal)
- Vacaciones aprobadas
- Bajas médicas aprobadas
- Otras ausencias aprobadas
Vista: Calendario mensual con días marcados por colores según tipo
```

### Solicitar Ausencia (Nueva)
```
Endpoints:
- GET /absence-categories/active (obtener tipos de ausencia)
- POST /vacations (crear solicitud)

Campos:
- Tipo de ausencia (dropdown con categorías)
- Fecha inicio
- Fecha fin
- Motivo/notas

Tipos disponibles:
- Vacaciones
- Baja médica
- Asuntos propios
- Permiso retribuido
- Permiso no retribuido
- Maternidad/Paternidad
- Otros
```

### Ausencias Admin (Nueva)
```
Endpoints:
- GET /vacations (todas las solicitudes)
- PUT /vacations/:id/status (aprobar/rechazar)

Mostrar:
- Lista de solicitudes pendientes
- Filtros: estado (pending/approved/rejected), empleado, tipo
- Acciones: aprobar, rechazar
```

### Horarios Admin (Arreglar)
```
Endpoint: GET /weekly-schedules/employee/:id/week/:year/:weekNumber

Filtros necesarios:
- Selector de empleado
- Selector de año
- Selector de semana (1-52)

El backend ya soporta esto, solo falta implementar en el frontend.
```

---

## 🗂️ Archivos a Modificar/Crear

### Crear
- `src/screens/employee/CalendarScreen.js`
- `src/screens/employee/RequestAbsenceScreen.js`
- `src/screens/admin/AbsencesScreen.js`

### Modificar
- `src/navigation/EmployeeNavigator.js` - Cambiar a 4 tabs
- `src/navigation/AdminNavigator.js` - Quitar IA, añadir Ausencias
- `src/screens/admin/SchedulesScreen.js` - Añadir filtro por semana
- `src/services/apiService.js` - Añadir servicios de ausencias

### Eliminar/Mover
- Quitar AIInsightsScreen del AdminNavigator
- Mover ProfileScreen a menú de settings (opcional)

---

## 📊 Estado Actual

| Componente | Estado | Prioridad |
|------------|--------|-----------|
| OAuth Google | ✅ Funcionando | - |
| Menú Empleado | 🔧 Pendiente reestructurar | Alta |
| Menú Admin | 🔧 Pendiente ajustar | Alta |
| Calendario Empleado | ⏳ Por crear | Alta |
| Solicitar Ausencia | ⏳ Por crear | Alta |
| Ausencias Admin | ⏳ Por crear | Media |
| Filtro Horarios | ⏳ Por implementar | Media |

---

## 📅 Próximos Pasos

1. Reestructurar EmployeeNavigator a 4 tabs
2. Crear CalendarScreen para empleados
3. Crear RequestAbsenceScreen para empleados
4. Quitar IA del AdminNavigator
5. Crear AbsencesScreen para admin
6. Implementar filtro por semana en SchedulesScreen

---

**Última actualización:** Diciembre 2025
