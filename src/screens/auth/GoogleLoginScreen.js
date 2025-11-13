import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';

// Necesario para que funcione el OAuth en iOS
WebBrowser.maybeCompleteAuthSession();

// Obtener URL del backend (sin /api)
const getBackendUrl = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (apiUrl) {
    // Remover /api si existe
    return apiUrl.replace('/api', '');
  }
  return 'https://jarana-horas-back.onrender.com';
};

const API_URL = getBackendUrl();
console.log('🔐 Backend URL para OAuth:', API_URL);

const GoogleLoginScreen = () => {
  const { handleGoogleCallback } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Escuchar deep links para el callback de OAuth
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Verificar si la app se abrió con un deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async ({ url }) => {
    if (!url) return;

    // Extraer el token de la URL
    const params = Linking.parse(url);
    const token = params.queryParams?.token;
    const error = params.queryParams?.error;

    if (error) {
      Alert.alert('Error', getErrorMessage(error));
      setLoading(false);
      return;
    }

    if (token) {
      setLoading(true);
      const result = await handleGoogleCallback(token);
      if (!result.success) {
        Alert.alert('Error', result.error || 'Error al autenticar');
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // URL del backend para iniciar OAuth con parámetro mobile=true
      const authUrl = `${API_URL}/auth/google?mobile=true`;
      
      // Abrir el navegador para autenticación
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        Linking.createURL('/auth/callback')
      );

      if (result.type === 'success') {
        // El callback se manejará en handleDeepLink
        console.log('OAuth success:', result.url);
      } else if (result.type === 'cancel') {
        setLoading(false);
        Alert.alert('Cancelado', 'Autenticación cancelada');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setLoading(false);
      Alert.alert('Error', 'Error al iniciar sesión con Google');
    }
  };

  const getErrorMessage = (errorCode) => {
    const errors = {
      'google_auth_failed': 'Error al autenticar con Google. Intenta de nuevo.',
      'token_generation_failed': 'Error al generar el token. Contacta al administrador.',
      'no_token': 'No se recibió el token de autenticación.',
      'unauthorized': 'Tu email no está autorizado para acceder al sistema.'
    };
    return errors[errorCode] || 'Error desconocido. Intenta de nuevo.';
  };

  return (
    <LinearGradient
      colors={[colors.brandLight, colors.brandMedium, colors.brandDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <Image 
            source={require('../../../public/images/logo_jarana.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Registro Horario</Text>
          <Text style={styles.subtitle}>Sistema de Control de Asistencia</Text>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <Text style={styles.cardTitle}>Iniciar Sesión</Text>
          <Text style={styles.cardDescription}>
            Accede con tu cuenta de Google autorizada
          </Text>

          {/* Google Sign In Button */}
          <Button
            mode="contained"
            onPress={handleGoogleLogin}
            loading={loading}
            disabled={loading}
            style={styles.googleButton}
            contentStyle={styles.googleButtonContent}
            icon={() => (
              <View style={styles.googleIconContainer}>
                <Icon name="google" size={24} color={colors.brandDark} />
              </View>
            )}
          >
            <Text style={styles.googleButtonText}>
              Continuar con Google
            </Text>
          </Button>

          <View style={styles.infoBox}>
            <Icon name="information-outline" size={20} color={colors.brandMedium} />
            <Text style={styles.infoText}>
              Solo usuarios autorizados pueden acceder
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Registro Horario
          </Text>
          <Text style={styles.footerSubtext}>
            Autenticación segura con Google OAuth 2.0
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl * 2,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    padding: spacing.xs,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.brandCream,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.brandCream,
    opacity: 0.9,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.neutralLight,
    marginBottom: spacing.lg,
  },
  googleButtonContent: {
    paddingVertical: spacing.md,
  },
  googleIconContainer: {
    marginRight: spacing.sm,
  },
  googleButtonText: {
    color: colors.brandDark,
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandLight + '15',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.brandDark,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  footerText: {
    color: colors.brandCream,
    opacity: 0.9,
    fontSize: 14,
    fontWeight: '500',
  },
  footerSubtext: {
    color: colors.brandCream,
    opacity: 0.7,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});

export default GoogleLoginScreen;
