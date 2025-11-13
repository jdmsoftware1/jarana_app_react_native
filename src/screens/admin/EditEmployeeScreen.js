import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Switch } from 'react-native-paper';
import { employeeService } from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';

const EditEmployeeScreen = ({ route, navigation }) => {
  const { employeeId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    isActive: true,
  });

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getById(employeeId);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'employee',
        isActive: data.isActive !== false,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el empleado');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setSaving(true);
      await employeeService.update(employeeId, formData);
      Alert.alert('Éxito', 'Empleado actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo actualizar el empleado');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.form}>
        <Text style={styles.title}>Editar Empleado</Text>
        
        <TextInput
          label="Nombre Completo *"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: colors.brandLight } }}
        />

        <TextInput
          label="Email *"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          theme={{ colors: { primary: colors.brandLight } }}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Rol de Administrador</Text>
          <Switch
            value={formData.role === 'admin'}
            onValueChange={(value) =>
              setFormData({ ...formData, role: value ? 'admin' : 'employee' })
            }
            color={colors.brandLight}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Empleado Activo</Text>
          <Switch
            value={formData.isActive}
            onValueChange={(value) => setFormData({ ...formData, isActive: value })}
            color={colors.brandLight}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.button}
          buttonColor={colors.brandLight}
        >
          Guardar Cambios
        </Button>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    margin: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text.primary,
  },
  button: {
    marginTop: spacing.lg,
  },
});

export default EditEmployeeScreen;
