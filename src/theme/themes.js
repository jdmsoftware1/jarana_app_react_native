// Temas dinámicos por empresa
// Cada empresa puede tener su propio tema de colores y logo

export const themes = {
  // Tema por defecto - AliadaDigital
  aliadaDigital: {
    name: 'AliadaDigital',
    logo: require('../../assets/logo_AliadaDigital.jpg'),
    colors: {
      // Brand colors
      brandLight: '#4ECDC4',    // Turquesa/Teal
      brandMedium: '#2C5364',   // Azul medio
      brandDark: '#1B3A4B',     // Azul navy principal
      brandDeep: '#0F2A3D',     // Azul navy muy oscuro
      brandAccent: '#6FE4DB',   // Turquesa claro
      brandCream: '#F9F7F4',    // Fondo crema claro
      
      // Neutral colors
      neutralLight: '#F9F7F4',
      neutralMid: '#B8C5CC',
      neutralDark: '#1B3A4B',
      
      // Status colors
      success: '#10B981',
      successLight: '#D1FAE5',
      error: '#EF4444',
      errorLight: '#FEE2E2',
      warning: '#F59E0B',
      warningLight: '#FEF3C7',
      info: '#3B82F6',
      infoLight: '#DBEAFE',
      
      // UI colors
      white: '#FFFFFF',
      black: '#000000',
      gray: {
        50: '#E8EEF2',
        100: '#D1DEE5',
        200: '#A3BDCB',
        300: '#759CB1',
        400: '#477B97',
        500: '#2C5364',
        600: '#1B3A4B',
        700: '#0F2A3D',
        800: '#0A1F2E',
        900: '#05141F',
      },
      teal: {
        50: '#E6FAF8',
        100: '#CCF5F1',
        200: '#99EBE3',
        300: '#6FE4DB',
        400: '#4ECDC4',
        500: '#3DBDB4',
        600: '#2E9A93',
        700: '#237772',
        800: '#185451',
        900: '#0D3130',
      },
      
      // Specific use cases
      background: '#F9F7F4',
      surface: '#FFFFFF',
      border: '#B8C5CC',
      text: {
        primary: '#1B3A4B',
        secondary: '#2C5364',
        disabled: '#759CB1',
        inverse: '#F9F7F4',
      },
    },
  },
  
  // Tema Jarana (el anterior)
  jarana: {
    name: 'Jarana',
    logo: require('../../assets/icon.png'),
    colors: {
      // Brand colors
      brandLight: '#8B7355',
      brandMedium: '#6B5744',
      brandDark: '#4A3C2F',
      brandCream: '#F5F1E8',
      
      // Neutral colors
      neutralLight: '#F8F6F3',
      neutralMid: '#D4CEC5',
      neutralDark: '#2C2419',
      
      // Status colors
      success: '#10B981',
      successLight: '#D1FAE5',
      error: '#EF4444',
      errorLight: '#FEE2E2',
      warning: '#F59E0B',
      warningLight: '#FEF3C7',
      info: '#3B82F6',
      infoLight: '#DBEAFE',
      
      // UI colors
      white: '#FFFFFF',
      black: '#000000',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },
      
      // Specific use cases
      background: '#F8F6F3',
      surface: '#FFFFFF',
      border: '#D4CEC5',
      text: {
        primary: '#2C2419',
        secondary: '#6B5744',
        disabled: '#9CA3AF',
        inverse: '#F5F1E8',
      },
    },
  },
};

// Tema por defecto
export const defaultTheme = 'aliadaDigital';

export default themes;
