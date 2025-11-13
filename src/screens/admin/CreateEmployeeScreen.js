import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { employeeService } from '../../services/apiService';
import Card from '../../components/Card';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';

const CreateEmployeeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeCode: '',
    pin: '',
    role: 'employee',
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.employeeCode || !formData.pin) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      await employeeService.create(formData);
      Alert.alert('Éxito', 'Empleado creado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo crear el empleado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.form}>
        <Text style={styles.title}>Nuevo Empleado</Text>
        
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

        <TextInput
          label="Código de Empleado *"
          value={formData.employeeCode}
          onChangeText={(text) => setFormData({ ...formData, employeeCode: text.toUpperCase() })}
          mode="outlined"
          autoCapitalize="characters"
          style={styles.input}
          theme={{ colors: { primary: colors.brandLight } }}
        />

        <TextInput
          label="PIN (4-8 dígitos) *"
          value={formData.pin}
          onChangeText={(text) => setFormData({ ...formData, pin: text })}
          mode="outlined"
          keyboardType="numeric"
          secureTextEntry
          maxLength={8}
          style={styles.input}
          theme={{ colors: { primary: colors.brandLight } }}
        />

        <Button
          mode="contained"
          onPress={handleCreate}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor={colors.brandLight}
        >
          Crear Empleado
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
  button: {
    marginTop: spacing.md,
  },
});

export default CreateEmployeeScreen;
