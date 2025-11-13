/**
 * Feature Flags - Configuración de funcionalidades
 * Controla qué características están habilitadas en la app
 */

export const features = {
  // Chat con IA
  aiChat: process.env.EXPO_PUBLIC_ENABLE_AI_CHAT === 'true',
  
  // Insights con IA
  aiUtils: process.env.EXPO_PUBLIC_ENABLE_AI_UTILS === 'true',
  
  // Autenticación con Google
  googleAuth: process.env.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH !== 'false', // Por defecto true
  
  // 2FA
  twoFactorAuth: process.env.EXPO_PUBLIC_ENABLE_2FA !== 'false', // Por defecto true
};

// Log de features habilitadas (solo en desarrollo)
if (__DEV__) {
  console.log('🎯 Features habilitadas:', features);
}

export default features;
