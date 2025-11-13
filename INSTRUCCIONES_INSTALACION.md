# 📱 INSTRUCCIONES DE INSTALACIÓN Y PRUEBA

## 🚀 INICIO RÁPIDO (5 MINUTOS)

### **Paso 1: Instalar Dependencias**
```bash
cd app_movil
npm install
```

### **Paso 2: Configurar Backend**
Edita el archivo `src/config/api.js`:

```javascript
// Para Android Emulator (usa 10.0.2.2 en lugar de localhost)
export const API_BASE_URL = 'http://10.0.2.2:3000/api';

// Para iOS Simulator (usa localhost)
export const API_BASE_URL = 'http://localhost:3000/api';

// Para dispositivo físico (reemplaza con tu IP local)
export const API_BASE_URL = 'http://192.168.1.100:3000/api';
```

**¿Cómo obtener tu IP local?**
- Windows: `ipconfig` (busca "IPv4 Address")
- Mac/Linux: `ifconfig` o `ip addr`

### **Paso 3: Asegúrate que el Backend esté corriendo**
```bash
# En otra terminal, en la raíz del proyecto
cd ..
npm start
```

El backend debe estar corriendo en `http://localhost:3000`

### **Paso 4: Iniciar la App Móvil**
```bash
# En la carpeta app_movil
npm start
```

Esto abrirá Expo DevTools en tu navegador.

### **Paso 5: Abrir en tu Dispositivo**

#### **Opción A: Dispositivo Físico (Recomendado para pruebas reales)**
1. Instala **Expo Go** desde:
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android)
   - [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS)

2. Escanea el QR que aparece en la terminal o navegador:
   - Android: Usa la app Expo Go directamente
   - iOS: Usa la cámara del iPhone y toca el banner

3. **IMPORTANTE:** Tu dispositivo y tu PC deben estar en la misma red WiFi

#### **Opción B: Emulador Android**
```bash
npm run android
```
Requiere Android Studio instalado.

#### **Opción C: Simulador iOS (Solo Mac)**
```bash
npm run ios
```
Requiere Xcode instalado.

---

## 🧪 CÓMO PROBAR LA APP

### **1. Probar Login de Empleado**

1. En la pantalla inicial, toca **"Acceso Empleado"**
2. Usa las credenciales de un empleado existente:
   - **Código:** (el código de empleado, ej: `EMP001`)
   - **TOTP:** Genera el código desde la web o usa el QR

**Si no tienes un empleado:**
- Crea uno desde la web en Admin Dashboard > Empleados > Nuevo Empleado
- Guarda el QR del TOTP para generar códigos

### **2. Probar Login de Administrador**

1. En la pantalla inicial, toca **"Acceso Administrador"**
2. Usa las credenciales de un admin:
   - **Código:** (el código del admin)
   - **PIN:** (el PIN de 4-8 dígitos)

**Si no tienes un admin:**
- Crea un empleado desde la web
- Edítalo y marca "Rol de Administrador"
- Asigna un PIN

### **3. Probar Fichaje (Como Empleado)**

1. Inicia sesión como empleado
2. Ve a la pestaña **"Fichar"** (icono de reloj)
3. Toca el botón grande de **"FICHAR ENTRADA"**
4. Confirma la acción
5. Verás el estado cambiar a **"DENTRO"**
6. Opcionalmente añade notas
7. Toca **"FICHAR SALIDA"** para completar

### **4. Probar Dashboard de Empleado**

1. Ve a la pestaña **"Inicio"**
2. Verás:
   - Resumen de horas (hoy, semana, mes)
   - Estado actual (dentro/fuera)
   - Último registro
   - Accesos rápidos

3. Desliza hacia abajo para refrescar (Pull to Refresh)

### **5. Probar Mis Registros**

1. Ve a la pestaña **"Registros"**
2. Verás todos tus fichajes
3. Usa la barra de búsqueda para filtrar
4. Toca los chips para filtrar por período
5. Desliza hacia abajo para refrescar

### **6. Probar Mi Horario**

1. Ve a la pestaña **"Horario"**
2. Verás tu horario semanal
3. Días laborables vs días libres
4. Horarios de entrada/salida
5. Descansos si los tienes

### **7. Probar Perfil**

1. Ve a la pestaña **"Perfil"**
2. Verás tu información personal
3. Toca **"Cerrar Sesión"** para salir

### **8. Probar Dashboard de Admin**

1. Inicia sesión como administrador
2. Ve a la pestaña **"Dashboard"**
3. Verás:
   - Total de empleados
   - Empleados activos
   - Fichajes de hoy
   - Empleados trabajando ahora
   - Últimos fichajes

### **9. Probar Gestión de Empleados**

1. Ve a la pestaña **"Empleados"**
2. Verás la lista de todos los empleados
3. Usa la búsqueda para filtrar
4. Toca un empleado para ver detalles
5. Toca **"Editar"** para modificar
6. Toca **"Desactivar"** para desactivar
7. Usa el chip para mostrar/ocultar inactivos
8. Toca el botón **+** para crear nuevo empleado

### **10. Probar Registros (Admin)**

1. Ve a la pestaña **"Registros"**
2. Verás todos los fichajes del sistema
3. Usa filtros: Todos, Hoy, Esta Semana, Incompletos
4. Busca por nombre de empleado

### **11. Probar Horarios (Admin)**

1. Ve a la pestaña **"Horarios"**
2. Verás lista de empleados
3. Estado de asignación de horarios

### **12. Probar Configuración (Admin)**

1. Ve a la pestaña **"Ajustes"**
2. Verás tu perfil de admin
3. Opciones de configuración
4. Cerrar sesión

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Error: "Network request failed"**
**Causa:** La app no puede conectarse al backend.

**Soluciones:**
1. Verifica que el backend esté corriendo (`npm start` en la raíz)
2. Verifica la URL en `src/config/api.js`
3. Si usas dispositivo físico, usa tu IP local (no `localhost`)
4. Asegúrate de estar en la misma red WiFi
5. Desactiva temporalmente el firewall

### **Error: "Unable to resolve module"**
**Causa:** Dependencias no instaladas correctamente.

**Solución:**
```bash
rm -rf node_modules
npm install
npm start -- --reset-cache
```

### **Error: "401 Unauthorized"**
**Causa:** Token expirado o inválido.

**Solución:**
1. Cierra sesión y vuelve a iniciar
2. Verifica las credenciales
3. Asegúrate de que el empleado existe en la base de datos

### **La app se queda en "Loading..."**
**Causa:** Problema de conexión o backend no responde.

**Solución:**
1. Verifica que el backend esté corriendo
2. Revisa la consola de Expo para ver errores
3. Verifica la URL del API
4. Intenta refrescar la app (Cmd+R en iOS, R+R en Android)

### **No aparece el QR en la terminal**
**Causa:** Puerto ocupado o problema de red.

**Solución:**
```bash
npm start -- --tunnel
```
Esto creará un túnel público (más lento pero funciona siempre)

### **Expo Go no se conecta**
**Causa:** Problema de red o firewall.

**Soluciones:**
1. Asegúrate de estar en la misma WiFi
2. Desactiva VPN si tienes
3. Usa modo túnel: `npm start -- --tunnel`
4. Reinicia el router

---

## 📱 PROBAR EN DIFERENTES DISPOSITIVOS

### **Android Emulator**
```bash
# Asegúrate de tener Android Studio instalado
npm run android
```

**Configuración del API:**
```javascript
export const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

### **iOS Simulator (Solo Mac)**
```bash
# Asegúrate de tener Xcode instalado
npm run ios
```

**Configuración del API:**
```javascript
export const API_BASE_URL = 'http://localhost:3000/api';
```

### **Dispositivo Físico**
1. Instala Expo Go
2. Escanea el QR
3. Usa tu IP local en la configuración

**Configuración del API:**
```javascript
// Reemplaza con tu IP
export const API_BASE_URL = 'http://192.168.1.100:3000/api';
```

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

### **Checklist de Pruebas:**

#### **Autenticación:**
- [ ] Login de empleado funciona
- [ ] Login de admin funciona
- [ ] Sesión persiste al cerrar/abrir app
- [ ] Logout funciona correctamente
- [ ] Auto-logout en token expirado

#### **Empleado:**
- [ ] Dashboard muestra estadísticas
- [ ] Fichaje de entrada funciona
- [ ] Fichaje de salida funciona
- [ ] Registros se muestran correctamente
- [ ] Horario se muestra correctamente
- [ ] Perfil muestra información correcta

#### **Administrador:**
- [ ] Dashboard muestra métricas
- [ ] Lista de empleados carga
- [ ] Crear empleado funciona
- [ ] Editar empleado funciona
- [ ] Activar/Desactivar funciona
- [ ] Registros se muestran
- [ ] Filtros funcionan
- [ ] Búsqueda funciona

#### **UI/UX:**
- [ ] Pull to refresh funciona
- [ ] Loading spinners aparecen
- [ ] Mensajes de error son claros
- [ ] Confirmaciones funcionan
- [ ] Navegación es fluida
- [ ] Iconos se muestran correctamente

---

## 📊 DATOS DE PRUEBA

### **Crear Empleado de Prueba (desde la web):**

1. Ve a Admin Dashboard > Empleados > Nuevo Empleado
2. Completa:
   - Nombre: "Juan Pérez"
   - Email: "juan@test.com"
   - Código: "EMP001"
   - PIN: "1234"
3. Guarda el QR del TOTP
4. Usa estos datos para probar el login móvil

### **Crear Admin de Prueba:**

1. Crea un empleado normal
2. Edítalo y marca "Rol de Administrador"
3. Usa su código y PIN para login de admin

---

## 🎯 FLUJO DE PRUEBA COMPLETO

### **Escenario 1: Empleado Normal**
1. Login como empleado
2. Ver dashboard (debe mostrar 0 horas)
3. Fichar entrada
4. Ver dashboard (debe mostrar tiempo transcurrido)
5. Ver registros (debe aparecer el fichaje)
6. Ver horario (si tiene asignado)
7. Fichar salida
8. Ver registros (debe mostrar fichaje completo)
9. Logout

### **Escenario 2: Administrador**
1. Login como admin
2. Ver dashboard (debe mostrar métricas)
3. Ir a empleados
4. Crear nuevo empleado
5. Ver detalle del empleado creado
6. Editar empleado
7. Ir a registros
8. Filtrar por "Hoy"
9. Buscar por nombre
10. Logout

---

## 💡 TIPS PARA DESARROLLO

### **Ver Logs en Tiempo Real:**
```bash
# En la terminal donde corre Expo
# Los logs aparecerán automáticamente
```

### **Recargar la App:**
- **iOS:** Cmd + R
- **Android:** R + R (doble tap en R)
- **Ambos:** Agita el dispositivo y toca "Reload"

### **Abrir DevTools:**
- **iOS:** Cmd + D
- **Android:** Cmd + M (Mac) o Ctrl + M (Windows)
- **Ambos:** Agita el dispositivo

### **Limpiar Caché:**
```bash
npm start -- --reset-cache
```

---

## ✅ LISTO PARA PRODUCCIÓN

Una vez que hayas probado todo y funcione correctamente, puedes:

1. **Generar APK para Android:**
```bash
eas build --platform android
```

2. **Generar IPA para iOS:**
```bash
eas build --platform ios
```

Requiere configurar Expo Application Services (EAS).

---

## 📞 SOPORTE

Si encuentras algún problema:
1. Revisa la consola de Expo para errores
2. Verifica que el backend esté corriendo
3. Comprueba la configuración del API
4. Asegúrate de estar en la misma red

**¡La app está lista para usar!** 🎉📱
