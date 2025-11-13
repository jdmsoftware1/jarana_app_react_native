import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { employeeService } from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';
import { getInitials } from '../../utils/formatters';

const EmployeeDetailScreen = ({ route, navigation }) => {
  const { employeeId } = route.params;
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getById(employeeId);
      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee:', error);
      Alert.alert('Error', 'No se pudo cargar el empleado');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={getInitials(employee?.name)}
            style={{ backgroundColor: colors.brandLight }}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{employee?.name}</Text>
            <Text style={styles.code}>{employee?.employeeCode}</Text>
            <StatusBadge
              status={employee?.isActive ? 'active' : 'inactive'}
              label={employee?.isActive ? 'Activo' : 'Inactivo'}
            />
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>
        <View style={styles.infoRow}>
          <Icon name="email" size={20} color={colors.brandLight} />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{employee?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="shield-account" size={20} color={colors.brandLight} />
          <Text style={styles.infoLabel}>Rol:</Text>
          <Text style={styles.infoValue}>
            {employee?.role === 'admin' ? 'Administrador' : 'Empleado'}
          </Text>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="pencil"
          onPress={() => navigation.navigate('EditEmployee', { employeeId })}
          style={styles.button}
          buttonColor={colors.brandLight}
        >
          Editar
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileCard: {
    margin: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  code: {
    fontSize: 14,
    color: colors.text.secondary,
    marginVertical: spacing.xs,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  actions: {
    padding: spacing.lg,
  },
  button: {
    marginBottom: spacing.sm,
  },
});

export default EmployeeDetailScreen;
