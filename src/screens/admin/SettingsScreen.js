import React from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, List, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';

const SettingsScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <Card style={styles.section}>
        <View style={styles.userInfo}>
          <Icon name="account-circle" size={60} color={colors.brandLight} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userRole}>
              {user?.role === 'admin' ? 'Administrador' : 'Empleado'}
            </Text>
          </View>
        </View>
      </Card>

      {/* General Settings */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <List.Item
          title="Notificaciones"
          description="Gestionar notificaciones"
          left={(props) => <List.Icon {...props} icon="bell" color={colors.brandLight} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
        />
        <Divider />
        <List.Item
          title="Idioma"
          description="Español"
          left={(props) => <List.Icon {...props} icon="translate" color={colors.brandLight} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
        />
        <Divider />
        <List.Item
          title="Tema"
          description="Claro"
          left={(props) => <List.Icon {...props} icon="palette" color={colors.brandLight} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
        />
      </Card>

      {/* System Settings */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Sistema</Text>
        <List.Item
          title="Configuración de Empresa"
          description="Datos de la empresa"
          left={(props) => <List.Icon {...props} icon="office-building" color={colors.brandLight} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
        />
        <Divider />
        <List.Item
          title="Copias de Seguridad"
          description="Gestionar backups"
          left={(props) => <List.Icon {...props} icon="backup-restore" color={colors.brandLight} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
        />
      </Card>

      {/* About */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de</Text>
        <List.Item
          title="Versión"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information" color={colors.brandLight} />}
        />
        <Divider />
        <List.Item
          title="Términos y Condiciones"
          left={(props) => <List.Icon {...props} icon="file-document" color={colors.brandLight} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
        />
        <Divider />
        <List.Item
          title="Política de Privacidad"
          left={(props) => <List.Icon {...props} icon="shield-lock" color={colors.brandLight} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
        />
      </Card>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Registro Horario</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    margin: spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  userRole: {
    fontSize: 12,
    color: colors.brandLight,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorLight,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});

export default SettingsScreen;
