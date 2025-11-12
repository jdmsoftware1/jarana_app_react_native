# 🚀 Inicio Rápido - App Móvil

## ⚡ Configuración en 5 Minutos

### 1️⃣ Instalar Dependencias

```bash
cd app_movil
npm install
```

### 2️⃣ Configurar URL del Backend

Edita `src/config/api.js`:

```javascript
// Opción 1: Desarrollo local (computadora)
export const API_BASE_URL = 'http://localhost:3000/api';

// Opción 2: Android Emulator
export const API_BASE_URL = 'http://10.0.2.2:3000/api';

// Opción 3: Dispositivo físico (reemplaza con tu IP)
export const API_BASE_URL = 'http://192.168.1.100:3000/api';

// Opción 4: Producción
export const API_BASE_URL = 'https://tu-servidor.com/api';
```

**💡 Cómo obtener tu IP:**
- Windows: `ipconfig` → busca "IPv4"
- Mac/Linux: `ifconfig` → busca "inet"

### 3️⃣ Iniciar la App

```bash
npm start
```

### 4️⃣ Abrir en Dispositivo

**Opción A: Expo Go (Recomendado para desarrollo)**
1. Instala "Expo Go" desde Play Store o App Store
2. Escanea el código QR que aparece en la terminal
3. ¡Listo!

**Opción B: Emulador Android**
```bash
npm run android
```

**Opción C: Simulador iOS (solo Mac)**
```bash
npm run ios
```

---

## 👤 Usuarios de Prueba

### Administrador
- **Código:** (tu código de admin)
- **PIN:** (tu PIN de admin)

### Empleado
- **Código:** (código de empleado)
- **TOTP:** (código de 6 dígitos de la app autenticadora)

---

## 🎯 Funcionalidades Disponibles

### ✅ Implementado
- Login de administrador
- Login de empleado
- Navegación por roles
- Estructura completa de navegación
- Servicios API completos
- Tema y estilos

### ⏳ Por Implementar
- Pantallas de dashboard
- Fichaje de empleados
- Gestión de empleados
- Visualización de registros
- Horarios y plantillas
- Funcionalidades IA

---

## 🐛 Solución de Problemas Comunes

### ❌ No se conecta al backend

**Problema:** Error de red o timeout

**Solución:**
1. Verifica que el backend esté corriendo (`npm run dev` en la carpeta raíz)
2. Verifica la URL en `src/config/api.js`
3. Si usas dispositivo físico, asegúrate de estar en la misma red WiFi
4. Prueba con la IP de tu computadora en lugar de `localhost`

### ❌ Error al escanear QR

**Problema:** Expo Go no puede conectarse

**Solución:**
1. Asegúrate de estar en la misma red WiFi
2. Desactiva VPN si tienes una activa
3. Reinicia Expo: `expo start -c`

### ❌ Pantalla en blanco

**Problema:** La app se abre pero no muestra nada

**Solución:**
1. Revisa los logs: `npx react-native log-android` o `npx react-native log-ios`
2. Limpia caché: `expo start -c`
3. Reinstala dependencias: `rm -rf node_modules && npm install`

### ❌ Error de autenticación

**Problema:** No puedo iniciar sesión

**Solución:**
1. Verifica que el usuario exista en la base de datos
2. Para admin: verifica el PIN
3. Para empleado: verifica el código TOTP (cambia cada 30 segundos)
4. Verifica que el backend esté respondiendo correctamente

---

## 📱 Desarrollo

### Estructura de Carpetas

```
app_movil/
├── src/
│   ├── config/          # Configuración
│   ├── context/         # Context API
│   ├── navigation/      # Navegación
│   ├── screens/         # Pantallas
│   ├── components/      # Componentes
│   ├── services/        # API
│   ├── theme/           # Estilos
│   └── utils/           # Utilidades
├── assets/              # Imágenes
├── App.js               # Entrada
└── package.json         # Dependencias
```

### Añadir una Nueva Pantalla

1. Crea el archivo en `src/screens/`
2. Añádelo al navegador correspondiente
3. Importa los servicios necesarios
4. Usa el tema para estilos consistentes

### Usar los Servicios API

```javascript
import { employeeService } from '../services/apiService';

// Obtener empleados
const employees = await employeeService.getAll();

// Crear empleado
const newEmployee = await employeeService.create(data);
```

---

## 🎨 Tema y Estilos

### Colores Disponibles

```javascript
import colors from '../theme/colors';

// Colores de marca
colors.brandLight    // #8B7355
colors.brandMedium   // #6B5744
colors.brandDark     // #4A3C2F
colors.brandCream    // #F5F1E8

// Estados
colors.success       // Verde
colors.error         // Rojo
colors.warning       // Amarillo
colors.info          // Azul
```

### Espaciado

```javascript
import { spacing } from '../theme/theme';

spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 16px
spacing.lg    // 24px
spacing.xl    // 32px
spacing.xxl   // 48px
```

---

## 📦 Comandos Útiles

```bash
# Desarrollo
npm start              # Iniciar Expo
npm run android        # Abrir en Android
npm run ios            # Abrir en iOS

# Limpieza
expo start -c          # Limpiar caché
rm -rf node_modules    # Eliminar dependencias
npm install            # Reinstalar

# Build
expo build:android     # Construir APK
expo build:ios         # Construir IPA

# Logs
npx react-native log-android  # Ver logs Android
npx react-native log-ios      # Ver logs iOS
```

---

## 📚 Próximos Pasos

1. **Implementar pantallas faltantes** (ver `ARCHIVOS_PENDIENTES.md`)
2. **Crear componentes reutilizables**
3. **Añadir assets (iconos, splash)**
4. **Probar en dispositivos reales**
5. **Optimizar rendimiento**
6. **Preparar para producción**

---

## 💡 Tips

- **Hot Reload:** Los cambios se reflejan automáticamente
- **Shake Device:** Abre el menú de desarrollo
- **Console Logs:** Aparecen en la terminal de Expo
- **Debugging:** Usa React DevTools o Flipper

---

## 📞 Ayuda

- Revisa `README.md` para documentación completa
- Revisa `RESUMEN_IMPLEMENTACION.md` para ver el progreso
- Revisa `ARCHIVOS_PENDIENTES.md` para ver qué falta

---

**¡Listo para desarrollar!** 🚀

Cualquier duda, consulta la documentación oficial de [Expo](https://docs.expo.dev/) y [React Native](https://reactnative.dev/).
