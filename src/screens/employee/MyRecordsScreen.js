import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Text, Searchbar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { recordService } from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Card from '../../components/Card';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';
import { formatDate, formatTime, formatDuration } from '../../utils/dateUtils';

const MyRecordsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, week, month

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, filter, searchQuery]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await recordService.getMyRecords();
      setRecords(data.records || data);
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

    // Filtro por período
    const now = new Date();
    if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(r => new Date(r.checkIn) >= weekAgo);
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(r => new Date(r.checkIn) >= monthAgo);
    }

    // Filtro por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(r =>
        formatDate(r.checkIn).includes(searchQuery) ||
        r.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Buscar por fecha o notas..."
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
            selected={filter === 'week'}
            onPress={() => setFilter('week')}
            style={styles.chip}
            selectedColor={colors.brandLight}
          >
            Última Semana
          </Chip>
          <Chip
            selected={filter === 'month'}
            onPress={() => setFilter('month')}
            style={styles.chip}
            selectedColor={colors.brandLight}
          >
            Último Mes
          </Chip>
        </ScrollView>
      </View>

      {/* Records List */}
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
                <View style={styles.recordDate}>
                  <Icon name="calendar" size={16} color={colors.brandLight} />
                  <Text style={styles.dateText}>{formatDate(record.checkIn)}</Text>
                </View>
                {record.checkOut ? (
                  <View style={styles.completeBadge}>
                    <Icon name="check-circle" size={16} color={colors.success} />
                    <Text style={styles.completeText}>Completo</Text>
                  </View>
                ) : (
                  <View style={styles.incompleteBadge}>
                    <Icon name="clock-alert" size={16} color={colors.warning} />
                    <Text style={styles.incompleteText}>En curso</Text>
                  </View>
                )}
              </View>

              <View style={styles.recordTimes}>
                <View style={styles.timeRow}>
                  <Icon name="login" size={20} color={colors.success} />
                  <Text style={styles.timeLabel}>Entrada:</Text>
                  <Text style={styles.timeValue}>{formatTime(record.checkIn)}</Text>
                </View>
                {record.checkOut && (
                  <View style={styles.timeRow}>
                    <Icon name="logout" size={20} color={colors.error} />
                    <Text style={styles.timeLabel}>Salida:</Text>
                    <Text style={styles.timeValue}>{formatTime(record.checkOut)}</Text>
                  </View>
                )}
              </View>

              {record.totalHours !== null && record.totalHours !== undefined && (
                <View style={styles.durationContainer}>
                  <Icon name="timer" size={18} color={colors.brandLight} />
                  <Text style={styles.durationText}>
                    Duración: {formatDuration(record.totalHours)}
                  </Text>
                </View>
              )}

              {record.notes && (
                <View style={styles.notesContainer}>
                  <Icon name="note-text" size={16} color={colors.gray[500]} />
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
  recordDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completeText: {
    fontSize: 12,
    color: colors.success,
    marginLeft: 4,
    fontWeight: '600',
  },
  incompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  incompleteText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: 4,
    fontWeight: '600',
  },
  recordTimes: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
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

export default MyRecordsScreen;
