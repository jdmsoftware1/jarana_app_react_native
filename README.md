# 📱 Registro Horario - Aplicación Móvil

Aplicación móvil para el sistema de registro horario con autenticación Google OAuth.

## 🚀 Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

#### Modo Desarrollo (DEV)
```env
EXPO_PUBLIC_API_URL=http://192.168.31.164:3000
EXPO_PUBLIC_ENVIRONMENT=DEV
EXPO_PUBLIC_DEV_ROLE=admin
# O EXPO_PUBLIC_DEV_ROLE=employee para probar como empleado
```

#### Modo Producción (PRO)
```env
EXPO_PUBLIC_API_URL=https://jarana-horas-back.onrender.com
EXPO_PUBLIC_ENVIRONMENT=PRO
```

**Nota**: En modo DEV, la autenticación se saltea automáticamente y se usa un usuario mock con el rol especificado.

### 2. Instalación

```bash
npm install
```

### 3. Iniciar la App

```bash
npm start
```

## 🔐 Autenticación

La app usa **Google OAuth 2.0** exactamente igual que la aplicación web:

1. Usuario hace clic en "Continuar con Google"
2. Se abre el navegador con la autenticación de Google
3. El backend valida que el email esté autorizado
4. Si está autorizado, redirige a la app con el token
5. La app guarda el token y muestra el dashboard correspondiente

### Flujo de Autenticación

- **Administradores**: Acceden al dashboard de administración
- **Empleados**: Acceden al dashboard de empleado

## 📱 Pantalla de Empleado

La pantalla principal del empleado muestra:

1. **Horas trabajadas esta semana**
2. **Resumen de última acción** (ej: "Salida registrada a las 18:30")
3. **Botón para fichar entrada/salida**

Además tiene acceso a:
- Chat con IA
- Solicitar vacaciones  
- Ver registros completos
- Ver horario

## 🏗️ Estructura

```
src/
├── screens/
│   ├── auth/
│   │   └── GoogleLoginScreen.js    # Login con Google OAuth
│   ├── employee/
│   │   ├── EmployeeDashboardScreen.js  # Dashboard empleado
│   │   ├── CheckInOutScreen.js         # Fichar entrada/salida
│   │   ├── MyRecordsScreen.js          # Mis registros
│   │   └── ProfileScreen.js            # Perfil
│   └── admin/
│       └── ...                          # Pantallas de admin
├── navigation/
│   ├── AppNavigator.js              # Navegación principal
│   ├── EmployeeNavigator.js         # Navegación empleado
│   └── AdminNavigator.js            # Navegación admin
├── context/
│   └── AuthContext.js               # Contexto de autenticación
└── services/
    └── apiService.js                # Servicios API

```

## 🔧 Configuración del Backend

El backend debe tener configurado:

1. Google OAuth con las credenciales correctas
2. Redirect URI que incluya el esquema de la app: `registrohorario://auth/callback`
3. Lista de emails autorizados en la base de datos

## 📦 Dependencias Principales

- `expo` - Framework
- `react-navigation` - Navegación
- `react-native-paper` - UI Components
- `expo-web-browser` - OAuth flow
- `expo-auth-session` - Manejo de sesiones OAuth
- `axios` - HTTP client

## 🎨 Tema

La app usa el mismo esquema de colores que la web:
- Brand Light: #8B7355
- Brand Medium: #6B5744
- Brand Dark: #4A3F35

## 📱 Deep Linking

La app está configurada con el esquema `registrohorario://` para recibir callbacks de OAuth.

Configurado en `app.json`:
```json
{
  "expo": {
    "scheme": "registrohorario"
  }
}
```

## 🚀 Características

### Para Administradores
- ✅ Dashboard completo con estadísticas
- ✅ Gestión de empleados (crear, editar, activar/desactivar)
- ✅ Visualización de todos los registros
- ✅ Gestión de horarios y plantillas
- ✅ Horarios semanales
- ✅ Gestión de vacaciones
- ✅ Integración con IA (si está habilitada en backend)
- ✅ Configuración del sistema

### Para Empleados
- ✅ Fichaje rápido (entrada/salida)
- ✅ Dashboard personal con estadísticas
- ✅ Historial de registros
- ✅ Visualización de horario asignado
- ✅ Perfil y configuración personal
- ✅ Chat con IA (si está habilitada)

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Expo CLI instalado globalmente: `npm install -g expo-cli`
- Para Android: Android Studio con emulador configurado
- Para iOS: Xcode (solo en macOS)
- Backend del sistema corriendo

## 🛠️ Instalación

1. **Navegar a la carpeta de la app móvil:**
   ```bash
   cd app_movil
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar la URL del backend:**
   
   Edita `src/config/api.js` y configura la URL correcta:
   
   ```javascript
   // Para desarrollo local
   export const API_BASE_URL = 'http://localhost:3000/api';
   
   // Para Android Emulator
   export const API_BASE_URL = 'http://10.0.2.2:3000/api';
   
   // Para dispositivo físico (usa la IP de tu computadora)
   export const API_BASE_URL = 'http://192.168.1.X:3000/api';
   
   // Para producción
   export const API_BASE_URL = 'https://tu-servidor.com/api';
   ```

## 🚀 Ejecución

### Modo Desarrollo

```bash
# Iniciar Expo
npm start

# O directamente en Android
npm run android

# O directamente en iOS (solo macOS)
npm run ios
```

### Escanear QR con Expo Go

1. Instala Expo Go en tu dispositivo móvil
2. Ejecuta `npm start`
3. Escanea el código QR con la app Expo Go

## 📱 Estructura del Proyecto

```
app_movil/
├── src/
│   ├── config/           # Configuración (API, constantes)
│   ├── context/          # Context API (Auth, etc.)
│   ├── navigation/       # Navegación (Admin, Employee)
│   ├── screens/          # Pantallas de la app
│   │   ├── auth/         # Login y autenticación
│   │   ├── admin/        # Pantallas de administrador
│   │   └── employee/     # Pantallas de empleado
│   ├── components/       # Componentes reutilizables
│   ├── services/         # Servicios API
│   ├── theme/            # Tema, colores, estilos
│   └── utils/            # Utilidades
├── assets/               # Imágenes, iconos
├── App.js                # Punto de entrada
├── app.json              # Configuración de Expo
└── package.json          # Dependencias

```

## 🎨 Tema y Diseño

La app utiliza la misma paleta de colores que la versión web:
- **Brand Light:** #8B7355
- **Brand Medium:** #6B5744
- **Brand Dark:** #4A3C2F
- **Brand Cream:** #F5F1E8

## 🔐 Autenticación

### Login Administrador
- Código de empleado + PIN (4-8 dígitos)

### Login Empleado
- Código de empleado + Código TOTP (6 dígitos)

## 📊 Funcionalidades por Rol

### Admin
- Dashboard con métricas en tiempo real
- CRUD completo de empleados
- Visualización de todos los registros
- Gestión de horarios (plantillas, semanales)
- Aprobación de vacaciones
- Gestión de conocimiento IA
- Configuración del sistema

### Empleado
- Fichaje rápido con un toque
- Dashboard personal
- Historial de registros propios
- Visualización de horario
- Solicitud de vacaciones
- Chat con IA

## 🔧 Configuración Avanzada

### Cambiar URL del Backend

Edita `src/config/api.js`:

```javascript
export const API_BASE_URL = 'TU_URL_AQUI';
```

### Deshabilitar IA

La funcionalidad de IA se activa/desactiva automáticamente según la configuración del backend. No requiere cambios en la app móvil.

## 📦 Build para Producción

### Android (APK)

```bash
expo build:android
```

### iOS (IPA)

```bash
expo build:ios
```

### App Stores

Para publicar en Google Play o App Store, sigue la [documentación oficial de Expo](https://docs.expo.dev/distribution/introduction/).

## 🐛 Solución de Problemas

### No se conecta al backend

1. Verifica que el backend esté corriendo
2. Verifica la URL en `src/config/api.js`
3. Para Android Emulator usa `http://10.0.2.2:3000/api`
4. Para dispositivo físico usa la IP de tu computadora

### Error de autenticación

1. Verifica que el usuario exista en la base de datos
2. Para admin: verifica que el PIN sea correcto
3. Para empleado: verifica el código TOTP en la app autenticadora

### Pantalla en blanco

1. Revisa los logs con `npx react-native log-android` o `npx react-native log-ios`
2. Limpia caché: `expo start -c`

## 📝 Notas Importantes

- **Permisos:** La app requiere permisos de cámara para escanear códigos QR
- **Conectividad:** Requiere conexión a internet para comunicarse con el backend
- **Sesión:** La sesión se mantiene guardada localmente hasta que el usuario cierre sesión
- **Sincronización:** Los datos se sincronizan en tiempo real con el backend

## 🔄 Actualizaciones

Para actualizar la app:

```bash
git pull
cd app_movil
npm install
npm start
```

## 📞 Soporte

Para problemas o preguntas, consulta la documentación del proyecto principal.

---

**Versión:** 1.0.0  
**Última actualización:** Noviembre 2025
