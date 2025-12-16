import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../theme/colors';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import EmployeesScreen from '../screens/admin/EmployeesScreen';
import EmployeeDetailScreen from '../screens/admin/EmployeeDetailScreen';
import CreateEmployeeScreen from '../screens/admin/CreateEmployeeScreen';
import EditEmployeeScreen from '../screens/admin/EditEmployeeScreen';
import RecordsScreen from '../screens/admin/RecordsScreen';
import SchedulesScreen from '../screens/admin/SchedulesScreen';
import AbsencesScreen from '../screens/admin/AbsencesScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack para Dashboard
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Dashboard" 
      component={AdminDashboardScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// Stack para Empleados
const EmployeesStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="EmployeesList" 
      component={EmployeesScreen}
      options={{ title: 'Empleados' }}
    />
    <Stack.Screen 
      name="EmployeeDetail" 
      component={EmployeeDetailScreen}
      options={{ title: 'Detalle Empleado' }}
    />
    <Stack.Screen 
      name="CreateEmployee" 
      component={CreateEmployeeScreen}
      options={{ title: 'Nuevo Empleado' }}
    />
    <Stack.Screen 
      name="EditEmployee" 
      component={EditEmployeeScreen}
      options={{ title: 'Editar Empleado' }}
    />
  </Stack.Navigator>
);

// Stack para Registros
const RecordsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="RecordsList" 
      component={RecordsScreen}
      options={{ title: 'Registros' }}
    />
  </Stack.Navigator>
);

// Stack para Horarios
const SchedulesStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="SchedulesMain" 
      component={SchedulesScreen}
      options={{ title: 'Horarios' }}
    />
  </Stack.Navigator>
);

// Stack para Ausencias
const AbsencesStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="AbsencesMain" 
      component={AbsencesScreen}
      options={{ title: 'Ausencias' }}
    />
  </Stack.Navigator>
);

// Stack para Configuración
const SettingsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="SettingsMain" 
      component={SettingsScreen}
      options={{ title: 'Configuración' }}
    />
  </Stack.Navigator>
);

const AdminNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            switch (route.name) {
              case 'DashboardTab':
                iconName = 'view-dashboard';
                break;
              case 'EmployeesTab':
                iconName = 'account-group';
                break;
              case 'RecordsTab':
                iconName = 'clipboard-text';
                break;
              case 'SchedulesTab':
                iconName = 'calendar-clock';
                break;
              case 'AbsencesTab':
                iconName = 'calendar-remove';
                break;
              case 'SettingsTab':
                iconName = 'cog';
                break;
              default:
                iconName = 'circle';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.brandLight,
          tabBarInactiveTintColor: colors.gray[500],
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.border,
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 10) : 5,
            height: Platform.OS === 'android' ? 60 + Math.max(insets.bottom, 10) : 60,
          },
          headerShown: false,
        })}
      >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardStack}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen 
        name="EmployeesTab" 
        component={EmployeesStack}
        options={{ tabBarLabel: 'Empleados' }}
      />
      <Tab.Screen 
        name="RecordsTab" 
        component={RecordsStack}
        options={{ tabBarLabel: 'Registros' }}
      />
      <Tab.Screen 
        name="SchedulesTab" 
        component={SchedulesStack}
        options={{ tabBarLabel: 'Horarios' }}
      />
      <Tab.Screen 
        name="AbsencesTab" 
        component={AbsencesStack}
        options={{ tabBarLabel: 'Ausencias' }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsStack}
        options={{ tabBarLabel: 'Ajustes' }}
      />
    </Tab.Navigator>
    </View>
  );
};

export default AdminNavigator;
