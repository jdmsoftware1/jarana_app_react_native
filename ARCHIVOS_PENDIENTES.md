# 📋 Archivos Pendientes por Crear

## ✅ Archivos Ya Creados

### Configuración Base
- ✅ `package.json` - Dependencias del proyecto
- ✅ `app.json` - Configuración de Expo
- ✅ `babel.config.js` - Configuración de Babel
- ✅ `App.js` - Punto de entrada principal
- ✅ `README.md` - Documentación completa

### Configuración y Servicios
- ✅ `src/config/api.js` - Configuración de API
- ✅ `src/services/apiService.js` - Servicios completos de API
- ✅ `src/context/AuthContext.js` - Contexto de autenticación

### Tema
- ✅ `src/theme/colors.js` - Paleta de colores
- ✅ `src/theme/theme.js` - Tema completo

### Navegación
- ✅ `src/navigation/AppNavigator.js` - Navegador principal
- ✅ `src/navigation/AdminNavigator.js` - Navegador de admin
- ✅ `src/navigation/EmployeeNavigator.js` - Navegador de empleado

### Pantallas de Autenticación
- ✅ `src/screens/LoadingScreen.js` - Pantalla de carga
- ✅ `src/screens/auth/LoginSelectionScreen.js` - Selección de tipo de login
- ✅ `src/screens/auth/AdminLoginScreen.js` - Login de administrador
- ✅ `src/screens/auth/EmployeeLoginScreen.js` - Login de empleado

---

## 📝 Archivos por Crear

### Pantallas de Administrador (src/screens/admin/)

#### Dashboard
```javascript
// AdminDashboardScreen.js
- Estadísticas generales
- Gráficos de actividad
- Resumen de empleados activos
- Fichajes del día
- Accesos rápidos
```

#### Empleados
```javascript
// EmployeesScreen.js
- Lista de empleados
- Búsqueda y filtros
- Botones de acciones (crear, editar, activar/desactivar)

// EmployeeDetailScreen.js
- Información completa del empleado
- Estadísticas de horas
- Historial de registros
- QR Code
- Opciones de edición

// CreateEmployeeScreen.js
- Formulario de creación
- Validaciones
- Generación de TOTP

// EditEmployeeScreen.js
- Formulario de edición
- Actualización de datos
- Regenerar TOTP
```

#### Registros
```javascript
// RecordsScreen.js
- Lista de todos los registros
- Filtros por empleado, fecha, tipo
- Exportación de datos
- Estadísticas
```

#### Horarios
```javascript
// SchedulesScreen.js
- Menú principal de horarios
- Acceso a plantillas, semanales, vacaciones

// ScheduleTemplatesScreen.js
- Lista de plantillas
- Crear/editar/eliminar plantillas
- Asignar plantillas a empleados

// WeeklySchedulesScreen.js
- Vista semanal tipo calendario
- Asignar horarios por semana
- Copiar horarios entre semanas

// VacationsScreen.js
- Lista de solicitudes de vacaciones
- Aprobar/rechazar solicitudes
- Calendario de vacaciones
```

#### IA y Configuración
```javascript
// AIKnowledgeScreen.js
- Gestión de conocimiento IA
- Añadir/eliminar documentos
- Ver embeddings

// SettingsScreen.js
- Configuración general
- Perfil del admin
- Cerrar sesión
- Información de la app
```

### Pantallas de Empleado (src/screens/employee/)

```javascript
// EmployeeDashboardScreen.js
- Resumen personal
- Horas trabajadas (hoy, semana, mes)
- Último fichaje
- Accesos rápidos

// CheckInOutScreen.js
- Botón grande de fichar
- Estado actual (dentro/fuera)
- Último registro
- Notas opcionales

// MyRecordsScreen.js
- Historial de fichajes propios
- Filtros por fecha
- Estadísticas personales

// MyScheduleScreen.js
- Horario asignado
- Vista semanal
- Días laborables/libres

// ProfileScreen.js
- Información personal
- QR Code propio
- Configuración
- Cerrar sesión
```

### Componentes Reutilizables (src/components/)

```javascript
// Card.js
- Tarjeta genérica con sombra

// StatCard.js
- Tarjeta de estadística con icono

// EmployeeCard.js
- Tarjeta de empleado en lista

// RecordCard.js
- Tarjeta de registro

// ScheduleDay.js
- Componente de día en horario

// EmptyState.js
- Estado vacío con ilustración

// ErrorState.js
- Estado de error

// LoadingSpinner.js
- Spinner de carga personalizado

// Header.js
- Header personalizado

// SearchBar.js
- Barra de búsqueda

// FilterChip.js
- Chip de filtro

// StatusBadge.js
- Badge de estado (activo/inactivo)

// AIChat.js
- Chat con IA (si está habilitada)

// QRCodeDisplay.js
- Mostrar código QR

// DatePicker.js
- Selector de fecha

// TimePicker.js
- Selector de hora
```

### Utilidades (src/utils/)

```javascript
// dateUtils.js
- Formateo de fechas
- Cálculos de tiempo
- Obtener semana actual

// timeUtils.js
- Formateo de horas
- Cálculo de diferencias
- Validaciones

// validations.js
- Validaciones de formularios
- Validaciones de PIN/TOTP

// formatters.js
- Formateo de números
- Formateo de texto

// constants.js
- Constantes de la app
- Mensajes de error
- Configuraciones
```

### Assets

```
assets/
├── icon.png (1024x1024)
├── splash.png (2048x2048)
├── adaptive-icon.png (1024x1024)
└── favicon.png (48x48)
```

---

## 🎯 Prioridad de Implementación

### Alta Prioridad (Funcionalidad Básica)
1. ✅ Autenticación completa
2. ⏳ Dashboard de empleado
3. ⏳ Fichaje (CheckInOut)
4. ⏳ Dashboard de admin
5. ⏳ Lista de empleados

### Media Prioridad (Gestión)
6. ⏳ Gestión de empleados (CRUD)
7. ⏳ Visualización de registros
8. ⏳ Horarios básicos

### Baja Prioridad (Avanzado)
9. ⏳ Plantillas de horarios
10. ⏳ Horarios semanales
11. ⏳ Vacaciones
12. ⏳ Integración IA

---

## 📦 Próximos Pasos

1. **Crear componentes reutilizables básicos**
   - Card, StatCard, LoadingSpinner, EmptyState

2. **Implementar Dashboard de Empleado**
   - Vista principal
   - Estadísticas personales
   - Accesos rápidos

3. **Implementar Fichaje**
   - Botón de entrada/salida
   - Validaciones
   - Feedback visual

4. **Implementar Dashboard de Admin**
   - Estadísticas generales
   - Gráficos
   - Lista de actividad

5. **Implementar Gestión de Empleados**
   - Lista
   - Detalle
   - Crear/Editar

6. **Implementar funcionalidades avanzadas**
   - Horarios
   - Vacaciones
   - IA

---

## 💡 Notas de Implementación

### Componentes Comunes
- Usar React Native Paper para componentes UI
- Mantener consistencia con el tema
- Reutilizar componentes al máximo

### Gestión de Estado
- Context API para autenticación
- useState/useEffect para estado local
- AsyncStorage para persistencia

### Navegación
- Stack Navigator para flujos lineales
- Tab Navigator para secciones principales
- Parámetros para pasar datos entre pantallas

### API
- Todos los servicios ya están en `apiService.js`
- Usar try/catch para manejo de errores
- Mostrar feedback al usuario (Alert, Snackbar)

### Estilos
- Usar StyleSheet.create
- Importar colores y spacing del tema
- Responsive con Dimensions si es necesario

---

**Estado Actual:** Estructura base completada (30%)  
**Siguiente:** Implementar pantallas principales (Dashboard, Fichaje)
