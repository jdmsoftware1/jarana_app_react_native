import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, List, Divider, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';
import { getInitials } from '../../utils/formatters';

const ProfileScreen = () => {
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
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={getInitials(user?.name)}
            style={{ backgroundColor: colors.brandLight }}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.badgeContainer}>
              <StatusBadge
                status={user?.isActive ? 'active' : 'inactive'}
                label={user?.isActive ? 'Activo' : 'Inactivo'}
              />
            </View>
          </View>
        </View>
      </Card>

      {/* Employee Info */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Empleado</Text>
        <View style={styles.infoRow}>
          <Icon name="identifier" size={20} color={colors.brandLight} />
          <Text style={styles.infoLabel}>Código:</Text>
          <Text style={styles.infoValue}>{user?.employeeCode}</Text>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.infoRow}>
          <Icon name="shield-account" size={20} color={colors.brandLight} />
          <Text style={styles.infoLabel}>Rol:</Text>
          <Text style={styles.infoValue}>
            {user?.role === 'admin' ? 'Administrador' : 'Empleado'}
          </Text>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.infoRow}>
          <Icon name="calendar-plus" size={20} color={colors.brandLight} />
          <Text style={styles.infoLabel}>Fecha de Alta:</Text>
          <Text style={styles.infoValue}>
            {user?.createdAt || user?.created_at 
              ? new Date(user.createdAt || user.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric'
                })
              : 'No disponible'}
          </Text>
        </View>
      </Card>

      {/* Settings */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
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
          title="Privacidad"
          description="Política de privacidad"
          left={(props) => <List.Icon {...props} icon="shield-lock" color={colors.brandLight} />}
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
          title="Ayuda y Soporte"
          description="Obtener ayuda"
          left={(props) => <List.Icon {...props} icon="help-circle" color={colors.brandLight} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Soporte', 'Contacta con tu administrador para obtener ayuda')}
        />
      </Card>

      {/* Logout Button */}
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
  profileCard: {
    margin: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  email: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  badgeContainer: {
    marginTop: spacing.sm,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  divider: {
    marginVertical: spacing.xs,
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

export default ProfileScreen;
