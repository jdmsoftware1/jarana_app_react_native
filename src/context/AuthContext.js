import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/apiService';
import { tenantService } from '../services/tenantService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay sesión guardada al iniciar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 🔧 MODO DEV: Saltear autenticación
      const environment = process.env.EXPO_PUBLIC_ENVIRONMENT;
      const devRole = process.env.EXPO_PUBLIC_DEV_ROLE;

      console.log('🔍 Verificando modo:', {
        environment,
        devRole,
        allEnv: process.env
      });

      if (environment === 'DEV') {
        console.log('🔧 Modo DEV activado - Salteando autenticación');
        const mockUser = {
          id: 'dev-user-123',
          name: 'Usuario Dev',
          email: 'dev@test.com',
          role: devRole || 'employee',
          employeeCode: 'DEV001',
          isActive: true,
        };
        setUser(mockUser);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }
      
      console.log('🔐 Modo PRODUCCIÓN - Verificando autenticación normal');

      // Modo PRODUCCIÓN: Autenticación normal
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        // Verificar que el token siga siendo válido
        try {
          const response = await authService.verifyToken();
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } catch (error) {
          // Token inválido, limpiar
          await logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (employeeCode, credential, isAdmin = false) => {
    try {
      let response;
      
      if (isAdmin) {
        // Login con PIN para admin
        response = await authService.loginAdmin(employeeCode, credential);
      } else {
        // Login con TOTP para empleado
        response = await authService.loginEmployee(employeeCode, credential);
      }

      if (response.token && response.employee) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.employee));
        setUser(response.employee);
        setIsAuthenticated(true);
        return { success: true, user: response.employee };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al iniciar sesión' 
      };
    }
  };

  const handleGoogleCallback = async (token) => {
    try {
      await AsyncStorage.setItem('token', token);
      // Verificar el token y obtener datos del usuario
      const response = await authService.verifyToken();
      const employee = response.employee;
      
      // Consultar el rol desde la tabla tenants en Neon
      console.log('🔍 Consultando rol del tenant para:', employee.email);
      const tenantConfig = await tenantService.getTenantConfig(employee.email);
      console.log('📋 Tenant config:', tenantConfig);
      
      // Sobrescribir el rol del backend con el rol del tenant (normalizar a minúsculas)
      const tenantRole = (tenantConfig.role || employee.role).toLowerCase();
      const userWithTenantRole = {
        ...employee,
        role: tenantRole,
        enterpriseName: tenantConfig.enterpriseName,
        theme: tenantConfig.theme,
      };
      
      console.log('👤 Usuario final con rol de tenant:', userWithTenantRole.role);
      
      await AsyncStorage.setItem('user', JSON.stringify(userWithTenantRole));
      setUser(userWithTenantRole);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Google callback error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Limpiar cache del tenant si hay email
      if (user?.email) {
        await tenantService.clearTenantCache(user.email);
      }
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('currentApiUrl');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin: isAdmin(),
    login,
    logout,
    updateUser,
    checkAuth,
    handleGoogleCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
