import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';

const AdminLoginScreen = ({ navigation }) => {
  const [employeeCode, setEmployeeCode] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!employeeCode || !pin) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (pin.length < 4 || pin.length > 8) {
      Alert.alert('Error', 'El PIN debe tener entre 4 y 8 dígitos');
      return;
    }

    setLoading(true);
    try {
      const result = await login(employeeCode, pin, true);
      
      if (!result.success) {
        Alert.alert('Error', result.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.brandLight, colors.brandMedium]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={colors.brandCream} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Icon name="shield-account" size={80} color={colors.brandCream} />
            <Text style={styles.title}>Acceso Administrador</Text>
            <Text style={styles.subtitle}>
              Ingresa con tu código de empleado y PIN
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Código de Empleado"
              value={employeeCode}
              onChangeText={setEmployeeCode}
              mode="outlined"
              style={styles.input}
              autoCapitalize="characters"
              autoCorrect={false}
              left={<TextInput.Icon icon="account" />}
              theme={{
                colors: {
                  primary: colors.brandLight,
                  background: colors.white,
                },
              }}
            />

            <TextInput
              label="PIN"
              value={pin}
              onChangeText={setPin}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showPin}
              keyboardType="numeric"
              maxLength={8}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPin ? 'eye-off' : 'eye'}
                  onPress={() => setShowPin(!showPin)}
                />
              }
              theme={{
                colors: {
                  primary: colors.brandLight,
                  background: colors.white,
                },
              }}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            <View style={styles.infoBox}>
              <Icon name="information" size={20} color={colors.info} />
              <Text style={styles.infoText}>
                El PIN debe tener entre 4 y 8 dígitos
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.brandCream,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    color: colors.brandCream,
    opacity: 0.9,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  button: {
    marginTop: spacing.md,
    backgroundColor: colors.brandLight,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoLight,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  infoText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 12,
    color: colors.info,
  },
});

export default AdminLoginScreen;
