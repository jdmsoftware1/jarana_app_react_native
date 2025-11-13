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
import { employeeService, recordService } from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';
import { formatTime, formatHours } from '../../utils/formatters';

const AdminDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    todayRecords: 0,
    currentlyWorking: 0,
  });
  const [recentRecords, setRecentRecords] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employees, records] = await Promise.all([
        employeeService.getAll(),
        recordService.getAllRecords({ limit: 10 }),
      ]);

      const activeEmployees = employees.filter(e => e.isActive);
      const today = new Date().toDateString();
      const todayRecords = (records.records || records).filter(r =>
        new Date(r.checkIn).toDateString() === today
      );
      const currentlyWorking = todayRecords.filter(r => !r.checkOut).length;

      setStats({
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        todayRecords: todayRecords.length,
        currentlyWorking,
      });

      setRecentRecords((records.records || records).slice(0, 5));
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
              <Text style={styles.greeting}>Panel de Administración</Text>
              <Text style={styles.subtitle}>Bienvenido, {user?.name}</Text>
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
          })}
        </Text>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsSection}>
        <StatCard
          label="Total Empleados"
          value={stats.totalEmployees.toString()}
          icon="account-group"
          color={colors.info}
          change={`${stats.totalEmployees - stats.activeEmployees} inactivos`}
          onPress={() => navigation.navigate('EmployeesTab')}
        />

        <StatCard
          label="Empleados Activos"
          value={stats.activeEmployees.toString()}
          icon="account-check"
          color={colors.success}
          change={`${stats.activeEmployees} trabajando`}
          onPress={() => navigation.navigate('EmployeesTab')}
        />

        <StatCard
          label="Fichajes Hoy"
          value={stats.todayRecords.toString()}
          icon="clipboard-check"
          color={colors.brandLight}
          change={`${stats.currentlyWorking} actualmente dentro`}
          onPress={() => navigation.navigate('RecordsTab')}
        />

        <StatCard
          label="Trabajando Ahora"
          value={stats.currentlyWorking.toString()}
          icon="account-clock"
          color={colors.warning}
          onPress={() => navigation.navigate('RecordsTab')}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('EmployeesTab', { screen: 'CreateEmployee' })}
          >
            <Icon name="account-plus" size={28} color={colors.brandLight} />
            <Text style={styles.quickActionText}>Nuevo Empleado</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('RecordsTab')}
          >
            <Icon name="clipboard-text" size={28} color={colors.brandLight} />
            <Text style={styles.quickActionText}>Ver Registros</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('SchedulesTab')}
          >
            <Icon name="calendar-clock" size={28} color={colors.brandLight} />
            <Text style={styles.quickActionText}>Horarios</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Records */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimos Fichajes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RecordsTab')}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {recentRecords.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No hay fichajes recientes</Text>
          </Card>
        ) : (
          recentRecords.map((record) => (
            <Card key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View style={styles.recordEmployee}>
                  <Icon name="account" size={20} color={colors.brandLight} />
                  <Text style={styles.employeeName}>{record.employee?.name || record.Employee?.name || 'N/A'}</Text>
                </View>
                <Text style={styles.recordTime}>
                  {formatTime(record.checkIn)}
                </Text>
              </View>
              <View style={styles.recordDetails}>
                <View style={styles.recordType}>
                  <Icon
                    name={record.checkOut ? 'logout' : 'login'}
                    size={16}
                    color={record.checkOut ? colors.error : colors.success}
                  />
                  <Text style={styles.recordTypeText}>
                    {record.checkOut ? 'Salida' : 'Entrada'}
                  </Text>
                </View>
                {record.totalHours && (
                  <Text style={styles.recordHours}>
                    {formatHours(record.totalHours)}
                  </Text>
                )}
              </View>
            </Card>
          ))
        )}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  date: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.sm,
    textTransform: 'capitalize',
  },
  statsSection: {
    padding: spacing.lg,
  },
  section: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  seeAll: {
    fontSize: 14,
    color: colors.brandLight,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  quickAction: {
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
  quickActionText: {
    fontSize: 12,
    color: colors.text.primary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  recordCard: {
    marginBottom: spacing.md,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recordEmployee: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  recordTime: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordTypeText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  recordHours: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});

export default AdminDashboardScreen;
