import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../theme/colors';
import features from '../config/features';
import FloatingChatButton from '../components/FloatingChatButton';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import EmployeesScreen from '../screens/admin/EmployeesScreen';
import EmployeeDetailScreen from '../screens/admin/EmployeeDetailScreen';
import CreateEmployeeScreen from '../screens/admin/CreateEmployeeScreen';
import EditEmployeeScreen from '../screens/admin/EditEmployeeScreen';
import RecordsScreen from '../screens/admin/RecordsScreen';
import SchedulesScreen from '../screens/admin/SchedulesScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';
import AIChatScreen from '../screens/admin/AIChatScreen';
import AIInsightsScreen from '../screens/admin/AIInsightsScreen';

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

// Stack para Chat IA
const AIChatStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="AIChatMain" 
      component={AIChatScreen}
      options={{ title: 'Chat IA' }}
    />
  </Stack.Navigator>
);

// Stack para Insights IA
const AIInsightsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="AIInsightsMain" 
      component={AIInsightsScreen}
      options={{ title: 'Insights IA' }}
    />
  </Stack.Navigator>
);

const AdminNavigator = () => {
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
              case 'AIChatTab':
                iconName = 'robot';
                break;
              case 'AIInsightsTab':
                iconName = 'lightbulb-on';
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
      {features.aiUtils && (
        <Tab.Screen 
          name="AIInsightsTab" 
          component={AIInsightsStack}
          options={{ tabBarLabel: 'Insights' }}
        />
      )}
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsStack}
        options={{ tabBarLabel: 'Ajustes' }}
      />
    </Tab.Navigator>
    <FloatingChatButton />
    </View>
  );
};

export default AdminNavigator;
