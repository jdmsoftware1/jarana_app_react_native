import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de la API
// Cambia esto a la URL de tu servidor en producción
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Desarrollo
  : 'https://tu-servidor.com/api'; // Producción

// Para Android Emulator usa: http://10.0.2.2:3000/api
// Para dispositivo físico usa la IP de tu computadora: http://192.168.x.x:3000/api

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
