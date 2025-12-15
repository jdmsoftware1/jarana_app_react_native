import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { vacationService, absenceCategoryService } from '../../services/apiService';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';
import Card from '../../components/Card';

const RequestAbsenceScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch absence categories
      const categoriesResponse = await absenceCategoryService.getActive();
      setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
      
      // Fetch my requests
      const requestsResponse = await vacationService.getAll({ employeeId: user?.id });
      setMyRequests(Array.isArray(requestsResponse) ? requestsResponse : []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Selecciona un tipo de ausencia');
      return;
    }
    
    if (startDate > endDate) {
      Alert.alert('Error', 'La fecha de inicio no puede ser posterior a la fecha de fin');
      return;
    }

    try {
      setSubmitting(true);
      
      await vacationService.create({
        employeeId: user?.id,
        categoryId: selectedCategory,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        reason: reason,
        type: 'vacation'
      });
      
      Alert.alert(
        'Solicitud Enviada',
        'Tu solicitud de ausencia ha sido enviada correctamente. Recibirás una notificación cuando sea revisada.',
        [{ text: 'OK', onPress: () => {
          // Reset form
          setSelectedCategory(null);
          setStartDate(new Date());
          setEndDate(new Date());
          setReason('');
          fetchData();
        }}]
      );
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert('Error', error.response?.data?.error || 'No se pudo enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
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

  const calculateDays = () => {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brandLight} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Nueva Solicitud */}
      <Text style={styles.sectionTitle}>Nueva Solicitud</Text>
      
      <Card style={styles.formCard}>
        {/* Tipo de ausencia */}
        <Text style={styles.label}>Tipo de Ausencia</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryOption,
                selectedCategory === category.id && styles.categorySelected,
                { borderColor: category.color || colors.brandLight }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon || '📅'}</Text>
              <Text style={[
                styles.categoryName,
                selectedCategory === category.id && { color: category.color || colors.brandLight }
              ]}>
                {category.name}
              </Text>
              {selectedCategory === category.id && (
                <Icon name="check-circle" size={18} color={category.color || colors.brandLight} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Fechas */}
        <View style={styles.datesRow}>
          <View style={styles.dateField}>
            <Text style={styles.label}>Fecha Inicio</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Icon name="calendar" size={20} color={colors.brandLight} />
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString('es-ES')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateField}>
            <Text style={styles.label}>Fecha Fin</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Icon name="calendar" size={20} color={colors.brandLight} />
              <Text style={styles.dateText}>
                {endDate.toLocaleDateString('es-ES')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, date) => {
              setShowStartPicker(false);
              if (date) {
                setStartDate(date);
                if (date > endDate) setEndDate(date);
              }
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            minimumDate={startDate}
            onChange={(event, date) => {
              setShowEndPicker(false);
              if (date) setEndDate(date);
            }}
          />
        )}

        {/* Días calculados */}
        <View style={styles.daysInfo}>
          <Icon name="clock-outline" size={18} color={colors.gray[500]} />
          <Text style={styles.daysText}>
            {calculateDays()} día{calculateDays() !== 1 ? 's' : ''} solicitado{calculateDays() !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Motivo */}
        <Text style={styles.label}>Motivo (opcional)</Text>
        <TextInput
          mode="outlined"
          placeholder="Describe el motivo de tu solicitud..."
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={3}
          style={styles.textInput}
          outlineColor={colors.border}
          activeOutlineColor={colors.brandLight}
        />

        {/* Botón enviar */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting || !selectedCategory}
          style={styles.submitButton}
          buttonColor={colors.brandLight}
        >
          Enviar Solicitud
        </Button>
      </Card>

      {/* Mis Solicitudes */}
      <Text style={styles.sectionTitle}>Mis Solicitudes</Text>
      
      {myRequests.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Icon name="clipboard-text-outline" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyText}>No tienes solicitudes</Text>
        </Card>
      ) : (
        myRequests.map((request, index) => (
          <Card key={index} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.requestInfo}>
                <Text style={styles.requestType}>
                  {request.category?.name || 'Ausencia'}
                </Text>
                <Text style={styles.requestDates}>
                  {formatDate(request.startDate)} - {formatDate(request.endDate)}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                  {getStatusLabel(request.status)}
                </Text>
              </View>
            </View>
            {request.reason && (
              <Text style={styles.requestReason} numberOfLines={2}>
                {request.reason}
              </Text>
            )}
          </Card>
        ))
      )}

      <View style={{ height: 30 }} />
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  formCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  categoriesContainer: {
    marginTop: spacing.xs,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  categorySelected: {
    borderWidth: 2,
    backgroundColor: colors.brandLight + '10',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  datesRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  dateField: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  dateText: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  daysInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  daysText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.gray[600],
  },
  textInput: {
    backgroundColor: colors.white,
  },
  submitButton: {
    marginTop: spacing.lg,
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
  requestCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestInfo: {
    flex: 1,
  },
  requestType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  requestDates: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
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
  requestReason: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});

export default RequestAbsenceScreen;
