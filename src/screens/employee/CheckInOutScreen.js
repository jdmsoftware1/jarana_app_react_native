import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { recordService } from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';
import { formatTime, formatDuration } from '../../utils/dateUtils';

const CheckInOutScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await recordService.getStatus();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching status:', error);
      Alert.alert('Error', 'No se pudo obtener el estado actual');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setProcessing(true);
      await recordService.checkin('mobile', null, notes);
      Alert.alert('✅ Entrada Registrada', 'Has fichado correctamente');
      setNotes('');
      await fetchStatus();
    } catch (error) {
      console.error('Error checking in:', error);
      Alert.alert('Error', error.response?.data?.error || 'No se pudo registrar la entrada');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setProcessing(true);
      await recordService.checkout('mobile', null, notes);
      Alert.alert('✅ Salida Registrada', 'Has fichado correctamente');
      setNotes('');
      await fetchStatus();
    } catch (error) {
      console.error('Error checking out:', error);
      Alert.alert('Error', error.response?.data?.error || 'No se pudo registrar la salida');
    } finally {
      setProcessing(false);
    }
  };

  const handleAction = () => {
    if (status?.isCheckedIn) {
      Alert.alert(
        'Confirmar Salida',
        '¿Deseas registrar tu salida?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: handleCheckOut },
        ]
      );
    } else {
      Alert.alert(
        'Confirmar Entrada',
        '¿Deseas registrar tu entrada?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: handleCheckIn },
        ]
      );
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const isCheckedIn = status?.isCheckedIn;
  const currentRecord = status?.currentRecord;
  const lastRecord = status?.lastRecord;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchStatus} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[colors.brandLight, colors.brandMedium]}
        style={styles.header}
      >
        <Text style={styles.greeting}>Hola, {user?.name}</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
      </LinearGradient>

      {/* Estado Actual */}
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: isCheckedIn ? colors.success : colors.gray[300] }
        ]}>
          <Icon 
            name={isCheckedIn ? 'check-circle' : 'clock-outline'} 
            size={24} 
            color={colors.white} 
          />
          <Text style={styles.statusText}>
            {isCheckedIn ? 'DENTRO' : 'FUERA'}
          </Text>
        </View>
      </View>

      {/* Botón Principal de Fichaje */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: isCheckedIn ? colors.error : colors.success }
        ]}
        onPress={handleAction}
        disabled={processing}
        activeOpacity={0.8}
      >
        <Icon 
          name={isCheckedIn ? 'logout' : 'login'} 
          size={48} 
          color={colors.white} 
        />
        <Text style={styles.actionButtonText}>
          {isCheckedIn ? 'FICHAR SALIDA' : 'FICHAR ENTRADA'}
        </Text>
        {processing && (
          <Text style={styles.processingText}>Procesando...</Text>
        )}
      </TouchableOpacity>

      {/* Notas Opcionales */}
      <Card style={styles.notesCard}>
        <Text style={styles.notesLabel}>Notas (opcional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Añade una nota a tu fichaje..."
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.notesInput}
          theme={{
            colors: {
              primary: colors.brandLight,
              background: colors.white,
            },
          }}
        />
      </Card>

      {/* Información del Registro Actual */}
      {currentRecord && (
        <Card>
          <View style={styles.recordHeader}>
            <Icon name="clock-check" size={20} color={colors.brandLight} />
            <Text style={styles.recordTitle}>Registro Actual</Text>
          </View>
          <View style={styles.recordInfo}>
            <View style={styles.recordRow}>
              <Text style={styles.recordLabel}>Entrada:</Text>
              <Text style={styles.recordValue}>
                {formatTime(currentRecord.checkIn)}
              </Text>
            </View>
            {currentRecord.checkOut && (
              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>Salida:</Text>
                <Text style={styles.recordValue}>
                  {formatTime(currentRecord.checkOut)}
                </Text>
              </View>
            )}
            {currentRecord.totalHours && (
              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>Duración:</Text>
                <Text style={styles.recordValue}>
                  {formatDuration(currentRecord.totalHours)}
                </Text>
              </View>
            )}
          </View>
        </Card>
      )}

      {/* Último Registro */}
      {!isCheckedIn && lastRecord && (
        <Card>
          <View style={styles.recordHeader}>
            <Icon name="history" size={20} color={colors.gray[500]} />
            <Text style={styles.recordTitle}>Último Registro</Text>
          </View>
          <View style={styles.recordInfo}>
            <View style={styles.recordRow}>
              <Text style={styles.recordLabel}>Fecha:</Text>
              <Text style={styles.recordValue}>
                {lastRecord.checkIn || lastRecord.timestamp
                  ? new Date(lastRecord.checkIn || lastRecord.timestamp).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                  : 'Sin fecha'}
              </Text>
            </View>
            <View style={styles.recordRow}>
              <Text style={styles.recordLabel}>Entrada:</Text>
              <Text style={styles.recordValue}>
                {formatTime(lastRecord.checkIn)}
              </Text>
            </View>
            {lastRecord.checkOut && (
              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>Salida:</Text>
                <Text style={styles.recordValue}>
                  {formatTime(lastRecord.checkOut)}
                </Text>
              </View>
            )}
            {lastRecord.totalHours && (
              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>Duración:</Text>
                <Text style={styles.recordValue}>
                  {formatDuration(lastRecord.totalHours)}
                </Text>
              </View>
            )}
          </View>
        </Card>
      )}

      {/* Información */}
      <View style={styles.infoBox}>
        <Icon name="information" size={20} color={colors.info} />
        <Text style={styles.infoText}>
          {isCheckedIn 
            ? 'Recuerda fichar tu salida al terminar tu jornada'
            : 'Ficha tu entrada al comenzar tu jornada laboral'
          }
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    textTransform: 'capitalize',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: -30,
    marginBottom: spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  actionButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.md,
  },
  processingText: {
    fontSize: 14,
    color: colors.white,
    marginTop: spacing.sm,
    opacity: 0.8,
  },
  notesCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  notesInput: {
    backgroundColor: colors.white,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  recordInfo: {
    gap: spacing.sm,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  recordLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  recordValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoLight,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 12,
    color: colors.info,
    lineHeight: 18,
  },
});

export default CheckInOutScreen;
