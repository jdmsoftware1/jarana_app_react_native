import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { employeeService, scheduleService } from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Card from '../../components/Card';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';

const SchedulesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(data.filter(e => e.isActive));
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

    if (searchQuery) {
      filtered = filtered.filter(e =>
        e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Buscar empleado..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          theme={{ colors: { primary: colors.brandLight } }}
        />
      </View>

      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
      >
        {filteredEmployees.length === 0 ? (
          <EmptyState
            icon="calendar-blank"
            title="No hay empleados"
            message="No se encontraron empleados activos"
          />
        ) : (
          filteredEmployees.map((employee) => (
            <Card key={employee.id} style={styles.employeeCard}>
              <View style={styles.employeeHeader}>
                <View style={styles.employeeInfo}>
                  <Icon name="account" size={20} color={colors.brandLight} />
                  <View style={styles.employeeDetails}>
                    <Text style={styles.employeeName}>{employee.name}</Text>
                    <Text style={styles.employeeCode}>{employee.employeeCode}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.scheduleInfo}>
                <Icon name="calendar-clock" size={18} color={colors.gray[500]} />
                <Text style={styles.scheduleText}>
                  {employee.Schedule ? 'Horario asignado' : 'Sin horario asignado'}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    elevation: 0,
  },
  list: {
    flex: 1,
    padding: spacing.md,
  },
  employeeCard: {
    marginBottom: spacing.md,
  },
  employeeHeader: {
    marginBottom: spacing.md,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  employeeCode: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  scheduleText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
});

export default SchedulesScreen;
