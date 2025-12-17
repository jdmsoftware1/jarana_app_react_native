import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base del backend (para consultar tenants)
// IMPORTANTE: Debe apuntar al backend que tiene la ruta /api/tenant y conexión a Neon
const TENANT_API_URL = 'https://aliadadigital-back-front.onrender.com/api';
const EXPO_PUBLIC_ENVIRONMENT = process.env.EXPO_PUBLIC_ENVIRONMENT || 'PRO';

// APIs por defecto
const DEV_API_URL = 'http://192.168.1.100:3000/api';
const PROD_DEFAULT_API_URL = 'https://jarana-horas-back.onrender.com/api';

class TenantService {
  constructor() {
    this.currentTenant = null;
    this.apiUrl = null;
  }

  // Obtener configuración del tenant desde Neon (via backend)
  async getTenantConfig(email) {
    try {
      // En desarrollo, usar API local
      if (EXPO_PUBLIC_ENVIRONMENT === 'development') {
        console.log('🔧 Modo desarrollo - usando API local');
        return {
          apiUrl: DEV_API_URL,
          enterpriseName: 'Development',
          theme: 'aliadaDigital',
          role: 'admin',
        };
      }

      // Primero intentar desde cache
      const cached = await this.getCachedTenant(email);
      if (cached) {
        console.log('📦 Usando tenant cacheado:', cached.enterpriseName);
        return cached;
      }

      // Obtener desde el backend (que consulta Neon)
      console.log('🔍 Consultando tenant para:', email);
      console.log('🌐 URL:', `${TENANT_API_URL}/tenant?email=${encodeURIComponent(email)}`);
      const response = await fetch(`${TENANT_API_URL}/tenant?email=${encodeURIComponent(email)}`);
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Tenant response data:', JSON.stringify(data));
        console.log('✅ data.found:', data.found);
        console.log('✅ data.config:', JSON.stringify(data.config));
        console.log('✅ data.config.role:', data.config?.role);
        
        if (data.found && data.config) {
          console.log('💾 Cacheando y retornando config con rol:', data.config.role);
          await this.cacheTenant(email, data.config);
          return data.config;
        }
        
        // Si no se encontró, usar config por defecto del backend
        if (data.config) {
          console.log('⚠️ Usuario no encontrado, usando config por defecto con rol:', data.config.role);
          return data.config;
        }
      } else {
        console.log('❌ Response no OK:', response.status, response.statusText);
      }

      // Fallback por defecto
      console.log('🌐 Usando configuración por defecto');
      return {
        apiUrl: PROD_DEFAULT_API_URL,
        enterpriseName: 'AliadaDigital',
        theme: 'aliadaDigital',
        role: 'employee',
      };
    } catch (error) {
      console.error('Error getting tenant config:', error);
      return {
        apiUrl: PROD_DEFAULT_API_URL,
        enterpriseName: 'AliadaDigital',
        theme: 'aliadaDigital',
        role: 'employee',
      };
    }
  }

  // Cache del tenant
  async cacheTenant(email, config) {
    try {
      await AsyncStorage.setItem(`tenant_${email}`, JSON.stringify(config));
    } catch (error) {
      console.error('Error caching tenant:', error);
    }
  }

  async getCachedTenant(email) {
    try {
      const cached = await AsyncStorage.getItem(`tenant_${email}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      return null;
    }
  }

  // Limpiar cache del tenant
  async clearTenantCache(email) {
    try {
      await AsyncStorage.removeItem(`tenant_${email}`);
    } catch (error) {
      console.error('Error clearing tenant cache:', error);
    }
  }

  // Obtener la URL de API actual
  async getCurrentApiUrl() {
    const savedUrl = await AsyncStorage.getItem('currentApiUrl');
    return savedUrl || PROD_DEFAULT_API_URL;
  }

  // Guardar la URL de API actual
  async setCurrentApiUrl(url) {
    await AsyncStorage.setItem('currentApiUrl', url);
    this.apiUrl = url;
  }

  // Configurar tenant después del login
  async setupTenant(email) {
    const config = await this.getTenantConfig(email);
    await this.setCurrentApiUrl(config.apiUrl);
    this.currentTenant = config;
    return config;
  }
}

export const tenantService = new TenantService();
export default tenantService;
