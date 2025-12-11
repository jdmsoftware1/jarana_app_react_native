import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de la API usando variables de entorno
const getBaseUrl = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  
  if (apiUrl) {
    // Si la URL no tiene /api al final, añadirlo
    return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
  }
  
  // Fallback por defecto - Siempre usar Render en producción
  return 'https://jarana-horas-back.onrender.com/api';
};

export const API_BASE_URL = getBaseUrl();

console.log('🌐 API URL configurada:', API_BASE_URL);

export const getApiUrl = () => API_BASE_URL;

// Headers autenticados
export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Manejo de errores de autenticación
export const handleAuthError = async (status) => {
  if (status === 401) {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    // La navegación se manejará en el componente
    return true;
  }
  return false;
};
