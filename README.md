# 📱 Registro Horario - Aplicación Móvil

Aplicación móvil React Native para el sistema de registro horario, compatible con Android e iOS.

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
