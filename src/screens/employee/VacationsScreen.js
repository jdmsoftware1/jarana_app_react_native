import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Text, Button, TextInput, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { vacationService } from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Card from '../../components/Card';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';

const VacationsScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vacations, setVacations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [vacationType, setVacationType] = useState('vacation');
  const [reason, setReason] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const vacationTypes = [
    { value: 'vacation', label: 'Vacaciones', icon: 'beach' },
    { value: 'sick_leave', label: 'Baja médica', icon: 'hospital' },
    { value: 'personal', label: 'Asunto personal', icon: 'account' },
    { value: 'other', label: 'Otro', icon: 'dots-horizontal' },
  ];

  useEffect(() => {
    fetchVacations();
  }, []);

  const fetchVacations = async () => {
    try {
      setLoading(true);
      const data = await vacationService.getAll({ employeeId: user?.id });
      const vacationsArray = Array.isArray(data) ? data : (data.vacations || []);
      // Filtrar solo las vacaciones del usuario actual
      const myVacations = vacationsArray.filter(v => 
        v.employeeId === user?.id || v.employee?.id === user?.id
      );
      setVacations(myVacations);
    } catch (error) {
      console.error('Error fetching vacations:', error);
      Alert.alert('Error', 'No se pudieron cargar las vacaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateVacation = async () => {
    if (startDate > endDate) {
      Alert.alert('Error', 'La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    try {
      setSubmitting(true);
      await vacationService.create({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        type: vacationType,
        reason: reason.trim(),
      });
      Alert.alert('Éxito', 'Solicitud de vacaciones enviada correctamente');
      setShowCreateModal(false);
      resetForm();
      fetchVacations();
    } catch (error) {
      console.error('Error creating vacation:', error);
      Alert.alert('Error', error.response?.data?.error || 'No se pudo crear la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setVacationType('vacation');
    setReason('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'rejected': return colors.error;
      default: return colors.warning;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return 'Pendiente';
    }
  };

  const getTypeLabel = (type) => {
    const found = vacationTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  const getTypeIcon = (type) => {
    const found = vacationTypes.find(t => t.value === type);
    return found ? found.icon : 'calendar';
  };

  const filteredVacations = vacations.filter(v => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  const calculateDays = (start, end) => {
    const startD = new Date(start);
    const endD = new Date(end);
    return Math.ceil((endD - startD) / (1000 * 60 * 60 * 24)) + 1;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Header con filtros */}
      <View style={styles.header}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={styles.chip}
            selectedColor={colors.brandLight}
          >
            Todas
          </Chip>
          <Chip
            selected={filter === 'pending'}
            onPress={() => setFilter('pending')}
            style={styles.chip}
            selectedColor={colors.warning}
          >
            Pendientes
          </Chip>
          <Chip
            selected={filter === 'approved'}
            onPress={() => setFilter('approved')}
            style={styles.chip}
            selectedColor={colors.success}
          >
            Aprobadas
          </Chip>
          <Chip
            selected={filter === 'rejected'}
            onPress={() => setFilter('rejected')}
            style={styles.chip}
            selectedColor={colors.error}
          >
            Rechazadas
          </Chip>
        </ScrollView>
      </View>

      {/* Lista de vacaciones */}
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchVacations} />
        }
      >
        {filteredVacations.length === 0 ? (
          <EmptyState
            icon="calendar-blank"
            title="Sin solicitudes"
            message="No tienes solicitudes de vacaciones"
          />
        ) : (
          filteredVacations.map((vacation) => (
            <Card key={vacation.id} style={styles.vacationCard}>
              <View style={styles.cardHeader}>
                <View style={styles.typeContainer}>
                  <Icon name={getTypeIcon(vacation.type)} size={20} color={colors.brandLight} />
                  <Text style={styles.typeText}>{getTypeLabel(vacation.type)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vacation.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(vacation.status) }]}>
                    {getStatusLabel(vacation.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.datesContainer}>
                <View style={styles.dateRow}>
                  <Icon name="calendar-start" size={16} color={colors.gray[500]} />
                  <Text style={styles.dateLabel}>Inicio:</Text>
                  <Text style={styles.dateValue}>
                    {new Date(vacation.startDate).toLocaleDateString('es-ES')}
                  </Text>
                </View>
                <View style={styles.dateRow}>
                  <Icon name="calendar-end" size={16} color={colors.gray[500]} />
                  <Text style={styles.dateLabel}>Fin:</Text>
                  <Text style={styles.dateValue}>
                    {new Date(vacation.endDate).toLocaleDateString('es-ES')}
                  </Text>
                </View>
                <View style={styles.dateRow}>
                  <Icon name="counter" size={16} color={colors.brandLight} />
                  <Text style={styles.dateLabel}>Días:</Text>
                  <Text style={[styles.dateValue, { color: colors.brandLight }]}>
                    {calculateDays(vacation.startDate, vacation.endDate)}
                  </Text>
                </View>
              </View>

              {vacation.reason && (
                <View style={styles.reasonContainer}>
                  <Text style={styles.reasonLabel}>Motivo:</Text>
                  <Text style={styles.reasonText}>{vacation.reason}</Text>
                </View>
              )}

              {vacation.adminNotes && (
                <View style={styles.notesContainer}>
                  <Icon name="comment-text" size={14} color={colors.info} />
                  <Text style={styles.notesText}>{vacation.adminNotes}</Text>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>

      {/* Botón flotante para crear */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Icon name="plus" size={24} color={colors.white} />
      </TouchableOpacity>

      {/* Modal de crear solicitud */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Solicitud</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Icon name="close" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Tipo de ausencia */}
              <Text style={styles.inputLabel}>Tipo de ausencia</Text>
              <View style={styles.typeSelector}>
                {vacationTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      vacationType === type.value && styles.typeOptionSelected,
                    ]}
                    onPress={() => setVacationType(type.value)}
                  >
                    <Icon
                      name={type.icon}
                      size={20}
                      color={vacationType === type.value ? colors.white : colors.brandLight}
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        vacationType === type.value && styles.typeOptionTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Fecha inicio */}
              <Text style={styles.inputLabel}>Fecha de inicio</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Icon name="calendar" size={20} color={colors.brandLight} />
                <Text style={styles.dateButtonText}>
                  {startDate.toLocaleDateString('es-ES')}
                </Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    setShowStartPicker(false);
                    if (date) setStartDate(date);
                  }}
                  minimumDate={new Date()}
                />
              )}

              {/* Fecha fin */}
              <Text style={styles.inputLabel}>Fecha de fin</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Icon name="calendar" size={20} color={colors.brandLight} />
                <Text style={styles.dateButtonText}>
                  {endDate.toLocaleDateString('es-ES')}
                </Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    setShowEndPicker(false);
                    if (date) setEndDate(date);
                  }}
                  minimumDate={startDate}
                />
              )}

              {/* Días calculados */}
              <View style={styles.daysPreview}>
                <Icon name="counter" size={18} color={colors.brandLight} />
                <Text style={styles.daysPreviewText}>
                  Total: {calculateDays(startDate, endDate)} día(s)
                </Text>
              </View>

              {/* Motivo */}
              <Text style={styles.inputLabel}>Motivo (opcional)</Text>
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Describe el motivo de tu solicitud..."
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.reasonInput}
                theme={{ colors: { primary: colors.brandLight } }}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                mode="outlined"
                onPress={() => setShowCreateModal(false)}
                style={styles.cancelButton}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateVacation}
                loading={submitting}
                disabled={submitting}
                style={styles.submitButton}
                buttonColor={colors.brandLight}
              >
                Enviar Solicitud
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
  chip: {
    marginRight: spacing.sm,
  },
  list: {
    flex: 1,
    padding: spacing.md,
  },
  vacationCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  datesContainer: {
    gap: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  reasonContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: colors.infoLight,
    padding: spacing.sm,
    borderRadius: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    color: colors.info,
    marginLeft: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  modalBody: {
    padding: spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.brandLight,
    backgroundColor: colors.white,
  },
  typeOptionSelected: {
    backgroundColor: colors.brandLight,
  },
  typeOptionText: {
    fontSize: 14,
    color: colors.brandLight,
    marginLeft: spacing.xs,
  },
  typeOptionTextSelected: {
    color: colors.white,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  daysPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.neutralLight,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  daysPreviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandLight,
    marginLeft: spacing.sm,
  },
  reasonInput: {
    backgroundColor: colors.white,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default VacationsScreen;
