import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { vacationService, weeklyScheduleService } from '../../services/apiService';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';
import Card from '../../components/Card';

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Función para calcular el número de semana ISO
const getISOWeekNumber = (date) => {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  return 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

const CalendarScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [absences, setAbsences] = useState([]);
  const [weeklySchedules, setWeeklySchedules] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const year = currentDate.getFullYear();
      
      // Cargar ausencias
      const response = await vacationService.getAll({ 
        employeeId: user?.id,
        year: year,
        status: 'approved'
      });
      
      // Filtrar solo las aprobadas
      const approvedAbsences = Array.isArray(response) 
        ? response.filter(v => v.status === 'approved')
        : [];
      
      setAbsences(approvedAbsences);
      
      // Cargar horarios semanales del año
      try {
        const schedulesResponse = await weeklyScheduleService.getByEmployeeYear(user?.id, year);
        console.log('📅 Weekly schedules loaded:', schedulesResponse);
        const schedules = schedulesResponse?.data || schedulesResponse || [];
        setWeeklySchedules(Array.isArray(schedules) ? schedules : []);
      } catch (scheduleError) {
        console.log('ℹ️ No schedules found:', scheduleError.message);
        setWeeklySchedules([]);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, currentDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const isDateInRange = (date, startDate, endDate) => {
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    d.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return d >= start && d <= end;
  };

  const getAbsenceForDate = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);
    
    return absences.find(absence => 
      isDateInRange(date, absence.startDate, absence.endDate)
    );
  };

  const getAbsenceColor = (absence) => {
    if (!absence) return null;
    
    const type = absence.type || absence.category?.code || 'vacation';
    switch (type.toLowerCase()) {
      case 'vacation':
      case 'vacaciones':
        return colors.success;
      case 'sick_leave':
      case 'baja_medica':
        return colors.error;
      case 'personal':
      case 'asuntos_propios':
        return colors.warning;
      default:
        return colors.info;
    }
  };

  const getAbsenceLabel = (absence) => {
    if (!absence) return '';
    
    if (absence.category?.name) return absence.category.name;
    
    const type = absence.type || 'vacation';
    switch (type.toLowerCase()) {
      case 'vacation':
        return 'Vacaciones';
      case 'sick_leave':
        return 'Baja médica';
      case 'personal':
        return 'Asuntos propios';
      default:
        return type;
    }
  };

  // Obtener el horario para un día específico
  const getScheduleForDate = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);
    const weekNumber = getISOWeekNumber(date);
    
    // Buscar el horario semanal que corresponde a esta semana
    const weeklySchedule = weeklySchedules.find(ws => 
      ws.year === year && ws.weekNumber === weekNumber
    );
    
    if (!weeklySchedule || !weeklySchedule.template || !weeklySchedule.template.templateDays) {
      return null;
    }
    
    // Obtener el día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
    // Convertir a formato de la BD (0=Lunes, 1=Martes, ..., 6=Domingo)
    const jsDay = date.getDay();
    const dbDay = jsDay === 0 ? 6 : jsDay - 1; // Convertir: Dom(0)->6, Lun(1)->0, etc.
    
    const daySchedule = weeklySchedule.template.templateDays.find(td => {
      const tdDay = td.dayOfWeek ?? td.day_of_week;
      return tdDay === dbDay;
    });
    
    return daySchedule;
  };

  // Verificar si un día tiene horario asignado
  const hasSchedule = (day) => {
    return getScheduleForDate(day) !== null;
  };

  // Formatear hora (HH:MM:SS -> HH:MM)
  const formatTime = (time) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
    const weeks = [];
    let days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell}>
          <Text style={styles.emptyDay}></Text>
        </View>
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const absence = getAbsenceForDate(day);
      const absenceColor = getAbsenceColor(absence);
      const dayHasSchedule = hasSchedule(day);
      const isToday = new Date().getDate() === day && 
                      new Date().getMonth() === currentDate.getMonth() &&
                      new Date().getFullYear() === currentDate.getFullYear();
      const isSelected = selectedDay === day;
      
      days.push(
        <TouchableOpacity 
          key={day} 
          style={[
            styles.dayCell,
            isToday && styles.todayCell,
            isSelected && styles.selectedCell,
            absenceColor && { backgroundColor: absenceColor + '30' },
            !absenceColor && dayHasSchedule && { backgroundColor: colors.brandLight + '15' }
          ]}
          onPress={() => setSelectedDay(day)}
        >
          <Text style={[
            styles.dayText,
            isToday && styles.todayText,
            isSelected && styles.selectedText,
            absenceColor && { color: absenceColor }
          ]}>
            {day}
          </Text>
          {absenceColor && (
            <View style={[styles.absenceDot, { backgroundColor: absenceColor }]} />
          )}
          {!absenceColor && dayHasSchedule && (
            <View style={[styles.absenceDot, { backgroundColor: colors.brandLight }]} />
          )}
        </TouchableOpacity>
      );
      
      if ((startingDay + day) % 7 === 0 || day === daysInMonth) {
        weeks.push(
          <View key={`week-${weeks.length}`} style={styles.weekRow}>
            {days}
          </View>
        );
        days = [];
      }
    }
    
    return weeks;
  };

  const renderSelectedDayInfo = () => {
    if (!selectedDay) return null;
    
    const absence = getAbsenceForDate(selectedDay);
    const daySchedule = getScheduleForDate(selectedDay);
    
    // Si hay ausencia, mostrar info de ausencia
    if (absence) {
      const color = getAbsenceColor(absence);
      const label = getAbsenceLabel(absence);
      
      return (
        <Card style={[styles.infoCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
          <View style={styles.infoHeader}>
            <Icon name="calendar-clock" size={24} color={color} />
            <Text style={[styles.infoTitle, { color }]}>{label}</Text>
          </View>
          <View style={styles.infoDetails}>
            <Text style={styles.infoLabel}>Desde:</Text>
            <Text style={styles.infoValue}>
              {new Date(absence.startDate).toLocaleDateString('es-ES')}
            </Text>
          </View>
          <View style={styles.infoDetails}>
            <Text style={styles.infoLabel}>Hasta:</Text>
            <Text style={styles.infoValue}>
              {new Date(absence.endDate).toLocaleDateString('es-ES')}
            </Text>
          </View>
          {absence.notes && (
            <View style={styles.infoDetails}>
              <Text style={styles.infoLabel}>Notas:</Text>
              <Text style={styles.infoValue}>{absence.notes}</Text>
            </View>
          )}
        </Card>
      );
    }
    
    // Si hay horario asignado, mostrar el horario del día
    if (daySchedule) {
      const isWorkingDay = daySchedule.isWorkingDay ?? daySchedule.is_working_day ?? true;
      const isSplitSchedule = daySchedule.isSplitSchedule ?? daySchedule.is_split_schedule ?? false;
      
      if (!isWorkingDay) {
        return (
          <Card style={[styles.infoCard, { borderLeftColor: colors.gray[400], borderLeftWidth: 4 }]}>
            <View style={styles.infoContent}>
              <Icon name="calendar-remove" size={24} color={colors.gray[400]} />
              <Text style={styles.infoText}>Día no laborable</Text>
            </View>
          </Card>
        );
      }
      
      return (
        <Card style={[styles.infoCard, { borderLeftColor: colors.brandLight, borderLeftWidth: 4 }]}>
          <View style={styles.infoHeader}>
            <Icon name="clock-outline" size={24} color={colors.brandLight} />
            <Text style={[styles.infoTitle, { color: colors.brandLight }]}>Horario del día</Text>
          </View>
          
          {isSplitSchedule ? (
            <>
              <View style={styles.scheduleRow}>
                <Icon name="weather-sunny" size={18} color={colors.warning} />
                <Text style={styles.scheduleLabel}>Mañana:</Text>
                <Text style={styles.scheduleValue}>
                  {formatTime(daySchedule.morningStart || daySchedule.morning_start)} - {formatTime(daySchedule.morningEnd || daySchedule.morning_end)}
                </Text>
              </View>
              <View style={styles.scheduleRow}>
                <Icon name="weather-night" size={18} color={colors.info} />
                <Text style={styles.scheduleLabel}>Tarde:</Text>
                <Text style={styles.scheduleValue}>
                  {formatTime(daySchedule.afternoonStart || daySchedule.afternoon_start)} - {formatTime(daySchedule.afternoonEnd || daySchedule.afternoon_end)}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.scheduleRow}>
              <Icon name="clock-time-four" size={18} color={colors.success} />
              <Text style={styles.scheduleLabel}>Jornada:</Text>
              <Text style={styles.scheduleValue}>
                {formatTime(daySchedule.startTime || daySchedule.start_time)} - {formatTime(daySchedule.endTime || daySchedule.end_time)}
              </Text>
            </View>
          )}
        </Card>
      );
    }
    
    // Sin horario ni ausencia
    return (
      <Card style={styles.infoCard}>
        <View style={styles.infoContent}>
          <Icon name="calendar-blank" size={24} color={colors.gray[400]} />
          <Text style={styles.infoText}>Sin horario asignado</Text>
        </View>
      </Card>
    );
  };

  const renderLegend = () => (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.brandLight }]} />
        <Text style={styles.legendText}>Horario</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
        <Text style={styles.legendText}>Vacaciones</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
        <Text style={styles.legendText}>Baja médica</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
        <Text style={styles.legendText}>Asuntos propios</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brandLight} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header del calendario */}
      <Card style={styles.calendarCard}>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
            <Icon name="chevron-left" size={28} color={colors.brandLight} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
            <Icon name="chevron-right" size={28} color={colors.brandLight} />
          </TouchableOpacity>
        </View>
        
        {/* Días de la semana */}
        <View style={styles.weekDaysRow}>
          {DAYS_OF_WEEK.map((day, index) => (
            <View key={index} style={styles.weekDayCell}>
              <Text style={[
                styles.weekDayText,
                (index === 0 || index === 6) && styles.weekendText
              ]}>
                {day}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Calendario */}
        {renderCalendar()}
      </Card>

      {/* Leyenda */}
      {renderLegend()}

      {/* Info del día seleccionado */}
      {renderSelectedDayInfo()}

      {/* Próximas ausencias */}
      <Text style={styles.sectionTitle}>Próximas Ausencias</Text>
      {absences.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Icon name="calendar-blank" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyText}>No tienes ausencias programadas</Text>
        </Card>
      ) : (
        absences.slice(0, 5).map((absence, index) => (
          <Card key={index} style={styles.absenceCard}>
            <View style={styles.absenceHeader}>
              <View style={[styles.absenceIcon, { backgroundColor: getAbsenceColor(absence) + '20' }]}>
                <Icon 
                  name="calendar-clock" 
                  size={20} 
                  color={getAbsenceColor(absence)} 
                />
              </View>
              <View style={styles.absenceInfo}>
                <Text style={styles.absenceType}>{getAbsenceLabel(absence)}</Text>
                <Text style={styles.absenceDates}>
                  {new Date(absence.startDate).toLocaleDateString('es-ES')} - {new Date(absence.endDate).toLocaleDateString('es-ES')}
                </Text>
              </View>
            </View>
          </Card>
        ))
      )}
      
      <View style={{ height: 20 }} />
    </ScrollView>
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
  calendarCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navButton: {
    padding: spacing.xs,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
  },
  weekendText: {
    color: colors.gray[400],
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 2,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
  },
  emptyDay: {
    color: 'transparent',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: colors.brandLight,
  },
  todayText: {
    fontWeight: '700',
    color: colors.brandLight,
  },
  selectedCell: {
    backgroundColor: colors.brandLight + '20',
  },
  selectedText: {
    fontWeight: '600',
  },
  absenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 4,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  infoCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: spacing.sm,
    color: colors.gray[500],
    fontSize: 14,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  infoDetails: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  scheduleLabel: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: spacing.sm,
    width: 70,
  },
  scheduleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray[500],
    width: 60,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyCard: {
    marginHorizontal: spacing.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: spacing.sm,
    color: colors.gray[500],
    fontSize: 14,
  },
  absenceCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  absenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  absenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absenceInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  absenceType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  absenceDates: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
});

export default CalendarScreen;
