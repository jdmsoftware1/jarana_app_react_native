import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { recordService, documentService } from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';
import { formatTime, formatHours } from '../../utils/formatters';

const EmployeeDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [unreadDocuments, setUnreadDocuments] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusData, statsData, documentsData] = await Promise.all([
        recordService.getStatus(),
        recordService.getHoursStats(user.id),
        documentService.getMyDocuments().catch(() => []),
      ]);
      setStatus(statusData);
      setStats(statsData);
      setUnreadDocuments(documentsData.filter(d => !d.readAt).length);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          onPress: logout,
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const isCheckedIn = status?.isCheckedIn;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[colors.brandLight, colors.brandMedium]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Hola, {user?.name}</Text>
              <Text style={styles.role}>{user?.role === 'admin' ? 'Administrador' : 'Empleado'}</Text>
            </View>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: isCheckedIn ? colors.success : colors.gray[400] }
            ]}>
              <Icon name={isCheckedIn ? 'check' : 'close'} size={20} color={colors.white} />
            </View>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Icon name="logout" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: isCheckedIn ? colors.error : colors.success }]}
          onPress={() => navigation.navigate('CheckInOutTab')}
        >
          <Icon name={isCheckedIn ? 'logout' : 'login'} size={32} color={colors.white} />
          <Text style={styles.quickActionText}>
            {isCheckedIn ? 'Fichar Salida' : 'Fichar Entrada'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen de Horas</Text>
        
        <StatCard
          label="Hoy"
          value={formatHours(stats?.today || 0)}
          icon="calendar-today"
          color={colors.brandLight}
        />

        <StatCard
          label="Esta Semana"
          value={formatHours(stats?.thisWeek || 0)}
          icon="calendar-week"
          color={colors.info}
          change={`${stats?.weekDays || 0} días trabajados`}
        />

        <StatCard
          label="Este Mes"
          value={formatHours(stats?.thisMonth || 0)}
          icon="calendar-month"
          color={colors.success}
          change={`${stats?.monthDays || 0} días trabajados`}
        />
      </View>

      {/* Current Status */}
      {status?.currentRecord && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado Actual</Text>
          <Card>
            <View style={styles.currentStatus}>
              <View style={styles.statusRow}>
                <Icon name="clock-in" size={24} color={colors.brandLight} />
                <View style={styles.statusInfo}>
                  <Text style={styles.statusLabel}>Entrada</Text>
                  <Text style={styles.statusValue}>
                    {formatTime(status.currentRecord.checkIn)}
                  </Text>
                </View>
              </View>
              {status.currentRecord.checkOut && (
                <View style={styles.statusRow}>
                  <Icon name="clock-out" size={24} color={colors.error} />
                  <View style={styles.statusInfo}>
                    <Text style={styles.statusLabel}>Salida</Text>
                    <Text style={styles.statusValue}>
                      {formatTime(status.currentRecord.checkOut)}
                    </Text>
                  </View>
                </View>
              )}
              <View style={styles.statusRow}>
                <Icon name="timer" size={24} color={colors.success} />
                <View style={styles.statusInfo}>
                  <Text style={styles.statusLabel}>Tiempo Trabajado</Text>
                  <Text style={styles.statusValue}>
                    {formatHours(status.currentRecord.totalHours || 0)}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Last Records */}
      {status?.lastRecord && !isCheckedIn && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Último Registro</Text>
          <Card>
            <View style={styles.recordItem}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>
                  {new Date(status.lastRecord.checkIn).toLocaleDateString('es-ES')}
                </Text>
                <StatusBadge status="completed" label="Completado" />
              </View>
              <View style={styles.recordDetails}>
                <Text style={styles.recordTime}>
                  {formatTime(status.lastRecord.checkIn)} - {formatTime(status.lastRecord.checkOut)}
                </Text>
                <Text style={styles.recordHours}>
                  {formatHours(status.lastRecord.totalHours || 0)}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => navigation.navigate('RecordsTab')}
          >
            <Icon name="clipboard-text" size={24} color={colors.brandLight} />
            <Text style={styles.quickLinkText}>Mis Registros</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => navigation.navigate('DocumentsTab')}
          >
            <View>
              <Icon name="file-document" size={24} color={colors.brandLight} />
              {unreadDocuments > 0 && (
                <View style={styles.quickLinkBadge}>
                  <Text style={styles.quickLinkBadgeText}>{unreadDocuments}</Text>
                </View>
              )}
            </View>
            <Text style={styles.quickLinkText}>Documentos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <Icon name="account" size={24} color={colors.brandLight} />
            <Text style={styles.quickLinkText}>Mi Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  role: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    textTransform: 'capitalize',
  },
  quickActions: {
    padding: spacing.lg,
    marginTop: -30,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.md,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  currentStatus: {
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 2,
  },
  recordItem: {
    gap: spacing.sm,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordDate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTime: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  recordHours: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  quickLink: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickLinkText: {
    fontSize: 12,
    color: colors.text.primary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  quickLinkBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLinkBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default EmployeeDashboardScreen;
