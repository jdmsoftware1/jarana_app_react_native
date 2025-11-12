import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../theme/colors';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import EmployeesScreen from '../screens/admin/EmployeesScreen';
import RecordsScreen from '../screens/admin/RecordsScreen';
import SchedulesScreen from '../screens/admin/SchedulesScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';

// Detail Screens
import EmployeeDetailScreen from '../screens/admin/EmployeeDetailScreen';
import CreateEmployeeScreen from '../screens/admin/CreateEmployeeScreen';
import EditEmployeeScreen from '../screens/admin/EditEmployeeScreen';
import ScheduleTemplatesScreen from '../screens/admin/ScheduleTemplatesScreen';
import WeeklySchedulesScreen from '../screens/admin/WeeklySchedulesScreen';
import VacationsScreen from '../screens/admin/VacationsScreen';
import AIKnowledgeScreen from '../screens/admin/AIKnowledgeScreen';

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
    <Stack.Screen 
      name="ScheduleTemplates" 
      component={ScheduleTemplatesScreen}
      options={{ title: 'Plantillas' }}
    />
    <Stack.Screen 
      name="WeeklySchedules" 
      component={WeeklySchedulesScreen}
      options={{ title: 'Horarios Semanales' }}
    />
    <Stack.Screen 
      name="Vacations" 
      component={VacationsScreen}
      options={{ title: 'Vacaciones' }}
    />
    <Stack.Screen 
      name="AIKnowledge" 
      component={AIKnowledgeScreen}
      options={{ title: 'Gestión IA' }}
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
  return (
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
          paddingBottom: 5,
          height: 60,
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
        name="SettingsTab" 
        component={SettingsStack}
        options={{ tabBarLabel: 'Ajustes' }}
      />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
