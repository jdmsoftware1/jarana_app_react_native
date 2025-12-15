import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';

const LoginSelectionScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={[colors.brandLight, colors.brandMedium, colors.brandDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <Image 
            source={require('../../../assets/logo_AliadaDigital.jpg')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>AliadaDigital</Text>
          <Text style={styles.subtitle}>Sistema de Control de Asistencia</Text>
        </View>

        {/* Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Clerk Login */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ClerkSignIn')}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Icon name="account-circle" size={48} color={colors.brandLight} />
            </View>
            <Text style={styles.cardTitle}>Acceso con Clerk</Text>
            <Text style={styles.cardDescription}>
              Autenticación segura con email
            </Text>
            <Icon name="chevron-right" size={24} color={colors.brandLight} />
          </TouchableOpacity>

          {/* Admin Login */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AdminLogin')}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Icon name="shield-account" size={48} color={colors.brandLight} />
            </View>
            <Text style={styles.cardTitle}>Administrador</Text>
            <Text style={styles.cardDescription}>
              Acceso completo al sistema
            </Text>
            <Icon name="chevron-right" size={24} color={colors.brandLight} />
          </TouchableOpacity>

          {/* Employee Login */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('EmployeeLogin')}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Icon name="account" size={48} color={colors.brandLight} />
            </View>
            <Text style={styles.cardTitle}>Empleado</Text>
            <Text style={styles.cardDescription}>
              Fichaje y consulta de registros
            </Text>
            <Icon name="chevron-right" size={24} color={colors.brandLight} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 AliadaDigital
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
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.brandCream,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: colors.brandCream,
    opacity: 0.9,
    marginTop: spacing.sm,
  },
  cardsContainer: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.neutralLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  cardDescription: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  footerText: {
    color: colors.brandCream,
    opacity: 0.8,
    fontSize: 12,
  },
});

export default LoginSelectionScreen;
