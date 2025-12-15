import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { Text, Searchbar, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { employeeService, weeklyScheduleService } from '../../services/apiService';
import EmptyState from '../../components/EmptyState';
import Card from '../../components/Card';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const SchedulesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  
  // Week selector
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, searchQuery]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchWeeklySchedule();
    }
  }, [selectedEmployee, selectedYear, selectedWeek]);

  const fetchEmployees = async () => {
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

  const fetchWeeklySchedule = async () => {
    if (!selectedEmployee) return;
    
    try {
      setLoadingSchedule(true);
      const response = await weeklyScheduleService.getByEmployeeWeek(
        selectedEmployee.id, 
        selectedYear, 
        selectedWeek
      );
      setWeeklySchedule(response?.data || response || null);
    } catch (error) {
      // 404 significa que no hay horario asignado para esa semana - no es un error
      if (error.response?.status === 404) {
        setWeeklySchedule(null);
      } else {
        console.error('Error fetching weekly schedule:', error);
        setWeeklySchedule(null);
      }
    } finally {
      setLoadingSchedule(false);
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

  const changeWeek = (direction) => {
    let newWeek = selectedWeek + direction;
    let newYear = selectedYear;
    
    if (newWeek < 1) {
      newYear--;
      newWeek = 52;
    } else if (newWeek > 52) {
      newYear++;
      newWeek = 1;
    }
    
    setSelectedYear(newYear);
    setSelectedWeek(newWeek);
  };

  const goToCurrentWeek = () => {
    setSelectedYear(new Date().getFullYear());
    setSelectedWeek(getWeekNumber(new Date()));
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brandLight} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con búsqueda */}
      <View style={styles.header}>
        <Searchbar
          placeholder="Buscar empleado..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Selector de semana */}
      <View style={styles.weekSelector}>
        <TouchableOpacity onPress={() => changeWeek(-1)} style={styles.weekNavButton}>
          <Icon name="chevron-left" size={24} color={colors.brandLight} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToCurrentWeek} style={styles.weekInfo}>
          <Text style={styles.weekText}>Semana {selectedWeek}</Text>
          <Text style={styles.yearText}>{selectedYear}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => changeWeek(1)} style={styles.weekNavButton}>
          <Icon name="chevron-right" size={24} color={colors.brandLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchEmployees} />}
      >
        {/* Lista de empleados */}
        <Text style={styles.sectionTitle}>Seleccionar Empleado</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.employeeList}>
          {filteredEmployees.map((employee) => (
            <TouchableOpacity
              key={employee.id}
              style={[
                styles.employeeChip,
                selectedEmployee?.id === employee.id && styles.employeeChipSelected
              ]}
              onPress={() => setSelectedEmployee(employee)}
            >
              <Text style={[
                styles.employeeChipText,
                selectedEmployee?.id === employee.id && styles.employeeChipTextSelected
              ]}>
                {employee.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Horario semanal */}
        {selectedEmployee ? (
          <View style={styles.scheduleSection}>
            <Text style={styles.sectionTitle}>
              Horario de {selectedEmployee.name}
            </Text>
            
            {loadingSchedule ? (
              <View style={styles.scheduleLoading}>
                <ActivityIndicator size="small" color={colors.brandLight} />
              </View>
            ) : weeklySchedule?.weeklySchedule?.template ? (
              <Card style={styles.scheduleCard}>
                <Text style={styles.templateName}>
                  {weeklySchedule.weeklySchedule.template.name}
                </Text>
                
                {weeklySchedule.weeklySchedule.template.templateDays?.map((day, index) => (
                  <View key={index} style={styles.dayRow}>
                    <Text style={styles.dayName}>
                      {DAYS_OF_WEEK[day.dayOfWeek] || `Día ${day.dayOfWeek}`}
                    </Text>
                    {day.isWorkingDay ? (
                      <View style={styles.daySchedule}>
                        <Text style={styles.timeText}>
                          {formatTime(day.startTime)} - {formatTime(day.endTime)}
                        </Text>
                        {day.splitShift && (
                          <Text style={styles.splitText}>
                            | {formatTime(day.splitStartTime)} - {formatTime(day.splitEndTime)}
                          </Text>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.offText}>Libre</Text>
                    )}
                  </View>
                ))}
              </Card>
            ) : (
              <Card style={styles.emptyScheduleCard}>
                <Icon name="calendar-blank" size={40} color={colors.gray[300]} />
                <Text style={styles.noScheduleText}>
                  Sin horario asignado para esta semana
                </Text>
              </Card>
            )}
          </View>
        ) : (
          <EmptyState
            icon="account-search"
            title="Selecciona un empleado"
            message="Elige un empleado para ver su horario semanal"
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: colors.gray[100],
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekNavButton: {
    padding: spacing.sm,
  },
  weekInfo: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  weekText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  yearText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  employeeList: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  employeeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  employeeChipSelected: {
    backgroundColor: colors.brandLight,
    borderColor: colors.brandLight,
  },
  employeeChipText: {
    fontSize: 13,
    color: colors.text,
  },
  employeeChipTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  scheduleSection: {
    marginTop: spacing.sm,
  },
  scheduleLoading: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  scheduleCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandLight,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  dayName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    width: 100,
  },
  daySchedule: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  splitText: {
    fontSize: 14,
    color: colors.gray[500],
    marginLeft: spacing.xs,
  },
  offText: {
    fontSize: 14,
    color: colors.gray[400],
    fontStyle: 'italic',
  },
  emptyScheduleCard: {
    marginHorizontal: spacing.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  noScheduleText: {
    marginTop: spacing.sm,
    color: colors.gray[500],
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SchedulesScreen;
