import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Searchbar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { recordService } from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Card from '../../components/Card';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';
import { formatDate, formatTime, formatDuration } from '../../utils/dateUtils';

const RecordsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, filter, searchQuery]);

  // Combinar registros de checkin/checkout en pares
  const combineRecords = (rawRecords) => {
    // Agrupar por empleado y día
    const grouped = {};
    
    rawRecords.forEach(record => {
      const employeeId = record.employeeId;
      const date = new Date(record.timestamp).toDateString();
      const key = `${employeeId}-${date}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          employee: record.employee,
          date: date,
          checkins: [],
          checkouts: []
        };
      }
      
      if (record.type === 'checkin') {
        grouped[key].checkins.push(record);
      } else {
        grouped[key].checkouts.push(record);
      }
    });
    
    // Crear registros combinados
    const combined = [];
    Object.values(grouped).forEach(group => {
      // Ordenar por timestamp
      group.checkins.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      group.checkouts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Emparejar checkins con checkouts
      const maxPairs = Math.max(group.checkins.length, group.checkouts.length);
      for (let i = 0; i < maxPairs; i++) {
        const checkin = group.checkins[i];
        const checkout = group.checkouts[i];
        
        if (checkin || checkout) {
          const checkInTime = checkin?.timestamp;
          const checkOutTime = checkout?.timestamp;
          
          let totalHours = null;
          if (checkInTime && checkOutTime) {
            const diff = new Date(checkOutTime) - new Date(checkInTime);
            totalHours = diff / (1000 * 60 * 60);
          }
          
          combined.push({
            id: checkin?.id || checkout?.id,
            employee: group.employee,
            checkIn: checkInTime,
            checkOut: checkOutTime,
            totalHours: totalHours,
            notes: checkin?.notes || checkout?.notes,
            device: checkin?.device || checkout?.device
          });
        }
      }
    });
    
    // Ordenar por fecha más reciente
    combined.sort((a, b) => new Date(b.checkIn || b.checkOut) - new Date(a.checkIn || a.checkOut));
    
    return combined;
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await recordService.getAllRecords();
      const rawRecords = data.records || data || [];
      const combinedRecords = combineRecords(rawRecords);
      setRecords(combinedRecords);
    } catch (error) {
      console.error('Error fetching records:', error);
      Alert.alert('Error', 'No se pudieron cargar los registros');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    const now = new Date();
    if (filter === 'today') {
      const today = now.toDateString();
      filtered = filtered.filter(r => new Date(r.checkIn || r.checkOut).toDateString() === today);
    } else if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(r => new Date(r.checkIn || r.checkOut) >= weekAgo);
    } else if (filter === 'incomplete') {
      filtered = filtered.filter(r => !r.checkOut);
    }

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.employee?.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Buscar por empleado..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          theme={{ colors: { primary: colors.brandLight } }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={styles.chip}
            selectedColor={colors.brandLight}
          >
            Todos
          </Chip>
          <Chip
            selected={filter === 'today'}
            onPress={() => setFilter('today')}
            style={styles.chip}
            selectedColor={colors.brandLight}
          >
            Hoy
          </Chip>
          <Chip
            selected={filter === 'week'}
            onPress={() => setFilter('week')}
            style={styles.chip}
            selectedColor={colors.brandLight}
          >
            Esta Semana
          </Chip>
          <Chip
            selected={filter === 'incomplete'}
            onPress={() => setFilter('incomplete')}
            style={styles.chip}
            selectedColor={colors.warning}
          >
            Incompletos
          </Chip>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchRecords} />}
      >
        {filteredRecords.length === 0 ? (
          <EmptyState
            icon="clipboard-text-off"
            title="No hay registros"
            message="No se encontraron registros con los filtros aplicados"
          />
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View style={styles.employeeInfo}>
                  <Icon name="account" size={18} color={colors.brandLight} />
                  <Text style={styles.employeeName}>{record.employee?.name || 'Sin nombre'}</Text>
                </View>
                <Text style={styles.recordDate}>{formatDate(record.checkIn || record.checkOut)}</Text>
              </View>

              <View style={styles.recordTimes}>
                <View style={styles.timeRow}>
                  <Icon name="login" size={18} color={colors.success} />
                  <Text style={styles.timeLabel}>Entrada:</Text>
                  <Text style={styles.timeValue}>{formatTime(record.checkIn)}</Text>
                </View>
                {record.checkOut ? (
                  <View style={styles.timeRow}>
                    <Icon name="logout" size={18} color={colors.error} />
                    <Text style={styles.timeLabel}>Salida:</Text>
                    <Text style={styles.timeValue}>{formatTime(record.checkOut)}</Text>
                  </View>
                ) : (
                  <View style={[styles.timeRow, styles.incompleteRow]}>
                    <Icon name="clock-alert" size={18} color={colors.warning} />
                    <Text style={styles.incompleteText}>Sin salida registrada</Text>
                  </View>
                )}
              </View>

              {record.totalHours !== null && record.totalHours !== undefined && (
                <View style={styles.durationContainer}>
                  <Icon name="timer" size={16} color={colors.brandLight} />
                  <Text style={styles.durationText}>
                    {formatDuration(record.totalHours)}
                  </Text>
                </View>
              )}

              {record.notes && (
                <View style={styles.notesContainer}>
                  <Icon name="note-text" size={14} color={colors.gray[500]} />
                  <Text style={styles.notesText}>{record.notes}</Text>
                </View>
              )}
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
  recordCard: {
    marginBottom: spacing.md,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  employeeInfo: {
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
  recordDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  recordTimes: {
    gap: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  incompleteRow: {
    backgroundColor: colors.warningLight,
    padding: spacing.sm,
    borderRadius: 8,
  },
  incompleteText: {
    fontSize: 14,
    color: colors.warning,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralLight,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandLight,
    marginLeft: spacing.xs,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    fontStyle: 'italic',
  },
});

export default RecordsScreen;
