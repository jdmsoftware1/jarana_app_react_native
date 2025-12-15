import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import themes, { defaultTheme } from '../theme/themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [theme, setTheme] = useState(themes[defaultTheme]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme && themes[savedTheme]) {
        setCurrentTheme(savedTheme);
        setTheme(themes[savedTheme]);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeTheme = async (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      setTheme(themes[themeName]);
      await AsyncStorage.setItem('appTheme', themeName);
    }
  };

  const setThemeByEnterprise = async (enterpriseName) => {
    // Mapear nombre de empresa a tema
    const enterpriseThemeMap = {
      'AliadaDigital': 'aliadaDigital',
      'Jarana': 'jarana',
      // Añadir más empresas aquí
    };
    
    const themeName = enterpriseThemeMap[enterpriseName] || defaultTheme;
    await changeTheme(themeName);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      colors: theme.colors,
      logo: theme.logo,
      themeName: currentTheme,
      enterpriseName: theme.name,
      changeTheme,
      setThemeByEnterprise,
      isLoading,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
