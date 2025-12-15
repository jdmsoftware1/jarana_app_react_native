import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Text, ActivityIndicator, Searchbar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { vacationService } from '../../services/apiService';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';
import Card from '../../components/Card';

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'approved', label: 'Aprobadas' },
  { key: 'rejected', label: 'Rechazadas' },
];

const AbsencesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [absences, setAbsences] = useState([]);
  const [filteredAbsences, setFilteredAbsences] = useState([]);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const response = await vacationService.getAll();
      const data = Array.isArray(response) ? response : [];
      setAbsences(data);
      applyFilters(data, activeFilter, searchQuery);
    } catch (error) {
      console.error('Error fetching absences:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters(absences, activeFilter, searchQuery);
  }, [activeFilter, searchQuery, absences]);

  const applyFilters = (data, filter, search) => {
    let filtered = [...data];
    
    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(a => a.status === filter);
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(a => 
        a.employee?.name?.toLowerCase().includes(searchLower) ||
        a.employee?.employeeCode?.toLowerCase().includes(searchLower) ||
        a.category?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredAbsences(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleApprove = (absence) => {
    Alert.alert(
      'Aprobar Solicitud',
      `¿Aprobar la solicitud de ${absence.employee?.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Aprobar', 
          onPress: async () => {
            try {
              await vacationService.updateStatus(absence.id, 'approved');
              fetchData();
              Alert.alert('Éxito', 'Solicitud aprobada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo aprobar la solicitud');
            }
          }
        }
      ]
    );
  };

  const handleReject = (absence) => {
    Alert.alert(
      'Rechazar Solicitud',
      `¿Rechazar la solicitud de ${absence.employee?.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Rechazar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await vacationService.updateStatus(absence.id, 'rejected');
              fetchData();
              Alert.alert('Éxito', 'Solicitud rechazada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo rechazar la solicitud');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'rejected': return colors.error;
      case 'pending': return colors.warning;
      default: return colors.gray[500];
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const pendingCount = absences.filter(a => a.status === 'pending').length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brandLight} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con contador de pendientes */}
      {pendingCount > 0 && (
        <View style={styles.alertBanner}>
          <Icon name="alert-circle" size={20} color={colors.white} />
          <Text style={styles.alertText}>
            {pendingCount} solicitud{pendingCount !== 1 ? 'es' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Buscador */}
      <Searchbar
        placeholder="Buscar por empleado..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={colors.gray[500]}
      />

      {/* Filtros */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((filter) => (
          <Chip
            key={filter.key}
            selected={activeFilter === filter.key}
            onPress={() => setActiveFilter(filter.key)}
            style={[
              styles.filterChip,
              activeFilter === filter.key && styles.filterChipActive
            ]}
            textStyle={[
              styles.filterChipText,
              activeFilter === filter.key && styles.filterChipTextActive
            ]}
          >
            {filter.label}
          </Chip>
        ))}
      </ScrollView>

      {/* Lista de ausencias */}
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAbsences.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon name="clipboard-check-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No hay solicitudes</Text>
          </Card>
        ) : (
          filteredAbsences.map((absence) => (
            <Card key={absence.id} style={styles.absenceCard}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.employeeInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {absence.employee?.name?.charAt(0) || '?'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.employeeName}>
                      {absence.employee?.name || 'Empleado'}
                    </Text>
                    <Text style={styles.employeeCode}>
                      {absence.employee?.employeeCode}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(absence.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(absence.status) }]}>
                    {getStatusLabel(absence.status)}
                  </Text>
                </View>
              </View>

              {/* Tipo y fechas */}
              <View style={styles.absenceDetails}>
                <View style={styles.detailRow}>
                  <Icon name="tag" size={16} color={colors.gray[500]} />
                  <Text style={styles.detailText}>
                    {absence.category?.name || 'Ausencia'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="calendar-range" size={16} color={colors.gray[500]} />
                  <Text style={styles.detailText}>
                    {formatDate(absence.startDate)} - {formatDate(absence.endDate)}
                  </Text>
                  <Text style={styles.daysText}>
                    ({calculateDays(absence.startDate, absence.endDate)} días)
                  </Text>
                </View>
                {absence.reason && (
                  <View style={styles.detailRow}>
                    <Icon name="text" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText} numberOfLines={2}>
                      {absence.reason}
                    </Text>
                  </View>
                )}
              </View>

              {/* Acciones (solo para pendientes) */}
              {absence.status === 'pending' && (
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(absence)}
                  >
                    <Icon name="close" size={18} color={colors.error} />
                    <Text style={[styles.actionText, { color: colors.error }]}>Rechazar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(absence)}
                  >
                    <Icon name="check" size={18} color={colors.success} />
                    <Text style={[styles.actionText, { color: colors.success }]}>Aprobar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          ))
        )}
        <View style={{ height: 20 }} />
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
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  alertText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  searchbar: {
    margin: spacing.md,
    backgroundColor: colors.white,
    elevation: 2,
  },
  filtersContainer: {
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.white,
    marginRight: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.brandLight,
  },
  filterChipText: {
    color: colors.gray[600],
  },
  filterChipTextActive: {
    color: colors.white,
  },
  list: {
    flex: 1,
  },
  emptyCard: {
    margin: spacing.md,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  employeeCode: {
    fontSize: 12,
    color: colors.gray[500],
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  absenceDetails: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  detailText: {
    fontSize: 13,
    color: colors.gray[700],
    marginLeft: spacing.sm,
    flex: 1,
  },
  daysText: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  rejectButton: {
    borderColor: colors.error,
    backgroundColor: colors.error + '10',
  },
  approveButton: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default AbsencesScreen;
