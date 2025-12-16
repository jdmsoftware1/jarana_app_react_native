import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scheduleService } from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Card from '../../components/Card';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';
import { formatTimeOnly } from '../../utils/dateUtils';

const MyScheduleScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schedule, setSchedule] = useState(null);

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching schedule...');
      const data = await scheduleService.getMySchedule();
      console.log('✅ Schedule data received:', JSON.stringify(data, null, 2));
      setSchedule(data);
    } catch (error) {
      // Si es 404, significa que no tiene horario asignado (no es un error)
      if (error.response?.status === 404) {
        console.log('ℹ️ No hay horario asignado para este empleado (404)');
        setSchedule(null);
      } else {
        console.error('❌ Error fetching schedule:', error.message, error.response?.data);
        Alert.alert('Error', 'No se pudo cargar el horario');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!schedule || !schedule.scheduleDays || schedule.scheduleDays.length === 0) {
    return (
      <EmptyState
        icon="calendar-blank"
        title="Sin Horario Asignado"
        message="Aún no tienes un horario asignado. Contacta con tu administrador."
      />
    );
  }

  // Ordenar días (Backend: 0=Lunes, 1=Martes, ..., 6=Domingo)
  const sortedDays = [...schedule.scheduleDays].sort((a, b) => {
    return a.dayOfWeek - b.dayOfWeek;
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchSchedule} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Mi Horario Semanal</Text>
        {schedule.templateName && (
          <Text style={styles.subtitle}>Plantilla: {schedule.templateName}</Text>
        )}
      </View>

      {sortedDays.map((day) => {
        // Backend: 0=Lunes, 1=Martes, ..., 6=Domingo
        const dayName = daysOfWeek[day.dayOfWeek];
        
        return (
          <Card key={day.id} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{dayName}</Text>
              {day.isWorkingDay ? (
                <View style={styles.workingBadge}>
                  <Icon name="briefcase" size={14} color={colors.success} />
                  <Text style={styles.workingText}>Laboral</Text>
                </View>
              ) : (
                <View style={styles.offBadge}>
                  <Icon name="home" size={14} color={colors.gray[500]} />
                  <Text style={styles.offText}>Libre</Text>
                </View>
              )}
            </View>

            {day.isWorkingDay && (
              <View style={styles.dayContent}>
                {day.isSplitSchedule ? (
                  <>
                    <View style={styles.timeBlock}>
                      <Icon name="weather-sunset-up" size={18} color={colors.brandLight} />
                      <Text style={styles.timeLabel}>Mañana:</Text>
                      <Text style={styles.timeValue}>
                        {formatTimeOnly(day.morningStart)} - {formatTimeOnly(day.morningEnd)}
                      </Text>
                    </View>
                    <View style={styles.timeBlock}>
                      <Icon name="weather-sunset-down" size={18} color={colors.brandLight} />
                      <Text style={styles.timeLabel}>Tarde:</Text>
                      <Text style={styles.timeValue}>
                        {formatTimeOnly(day.afternoonStart)} - {formatTimeOnly(day.afternoonEnd)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.timeBlock}>
                    <Icon name="clock-outline" size={18} color={colors.brandLight} />
                    <Text style={styles.timeLabel}>Horario:</Text>
                    <Text style={styles.timeValue}>
                      {formatTimeOnly(day.startTime)} - {formatTimeOnly(day.endTime)}
                    </Text>
                  </View>
                )}

                {day.breaks && day.breaks.length > 0 && (
                  <View style={styles.breaksContainer}>
                    <Text style={styles.breaksTitle}>Descansos:</Text>
                    {day.breaks.map((brk, idx) => (
                      <Text key={idx} style={styles.breakText}>
                        • {formatTimeOnly(brk.startTime)} - {formatTimeOnly(brk.endTime)}
                      </Text>
                    ))}
                  </View>
                )}

                {day.notes && (
                  <View style={styles.notesContainer}>
                    <Icon name="note-text" size={14} color={colors.gray[500]} />
                    <Text style={styles.notesText}>{day.notes}</Text>
                  </View>
                )}
              </View>
            )}
          </Card>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  dayCard: {
    margin: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  workingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  workingText: {
    fontSize: 12,
    color: colors.success,
    marginLeft: 4,
    fontWeight: '600',
  },
  offBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offText: {
    fontSize: 12,
    color: colors.gray[600],
    marginLeft: 4,
    fontWeight: '600',
  },
  dayContent: {
    gap: spacing.sm,
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralLight,
    padding: spacing.sm,
    borderRadius: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  breaksContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  breaksTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  breakText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    fontStyle: 'italic',
  },
});

export default MyScheduleScreen;
