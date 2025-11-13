import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, Searchbar, FAB, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { employeeService } from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';
import { getInitials } from '../../utils/formatters';

const EmployeesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, searchQuery, showInactive]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      Alert.alert('Error', 'No se pudieron cargar los empleados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];

    // Filtro por activos/inactivos
    if (!showInactive) {
      filtered = filtered.filter(e => e.isActive);
    }

    // Filtro por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(e =>
        e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  };

  const handleToggleActive = async (employee) => {
    const action = employee.isActive ? 'desactivar' : 'activar';
    Alert.alert(
      `Confirmar ${action}`,
      `¿Estás seguro de que quieres ${action} a ${employee.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await employeeService.toggleActive(employee.id);
              Alert.alert('Éxito', `Empleado ${action} correctamente`);
              fetchEmployees();
            } catch (error) {
              Alert.alert('Error', `No se pudo ${action} el empleado`);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Buscar empleados..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          theme={{ colors: { primary: colors.brandLight } }}
        />
        <View style={styles.chips}>
          <Chip
            selected={showInactive}
            onPress={() => setShowInactive(!showInactive)}
            style={styles.chip}
            selectedColor={colors.brandLight}
            icon={showInactive ? 'eye' : 'eye-off'}
          >
            {showInactive ? 'Mostrar solo activos' : 'Mostrar inactivos'}
          </Chip>
        </View>
      </View>

      {/* Employees List */}
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchEmployees} />
        }
      >
        {filteredEmployees.length === 0 ? (
          <EmptyState
            icon="account-off"
            title="No hay empleados"
            message="No se encontraron empleados con los filtros aplicados"
          />
        ) : (
          filteredEmployees.map((employee) => (
            <Card
              key={employee.id}
              style={styles.employeeCard}
              onPress={() => navigation.navigate('EmployeeDetail', { employeeId: employee.id })}
            >
              <View style={styles.employeeHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(employee.name)}</Text>
                </View>
                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>{employee.name}</Text>
                  <Text style={styles.employeeCode}>{employee.employeeCode}</Text>
                  <Text style={styles.employeeEmail}>{employee.email}</Text>
                </View>
                <StatusBadge
                  status={employee.isActive ? 'active' : 'inactive'}
                  label={employee.isActive ? 'Activo' : 'Inactivo'}
                />
              </View>

              <View style={styles.employeeActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('EditEmployee', { employeeId: employee.id })}
                >
                  <Icon name="pencil" size={18} color={colors.info} />
                  <Text style={[styles.actionText, { color: colors.info }]}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleToggleActive(employee)}
                >
                  <Icon
                    name={employee.isActive ? 'account-off' : 'account-check'}
                    size={18}
                    color={employee.isActive ? colors.error : colors.success}
                  />
                  <Text
                    style={[
                      styles.actionText,
                      { color: employee.isActive ? colors.error : colors.success },
                    ]}
                  >
                    {employee.isActive ? 'Desactivar' : 'Activar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        color={colors.white}
        onPress={() => navigation.navigate('CreateEmployee')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    marginBottom: spacing.sm,
    elevation: 0,
  },
  chips: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: spacing.sm,
  },
  list: {
    flex: 1,
    padding: spacing.md,
  },
  employeeCard: {
    marginBottom: spacing.md,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  employeeCode: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  employeeEmail: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  employeeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.brandLight,
  },
});

export default EmployeesScreen;
