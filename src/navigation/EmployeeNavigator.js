import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../theme/colors';

// Employee Screens
import EmployeeDashboardScreen from '../screens/employee/EmployeeDashboardScreen';
import CheckInOutScreen from '../screens/employee/CheckInOutScreen';
import MyRecordsScreen from '../screens/employee/MyRecordsScreen';
import MyScheduleScreen from '../screens/employee/MyScheduleScreen';
import ProfileScreen from '../screens/employee/ProfileScreen';
import DocumentsScreen from '../screens/employee/DocumentsScreen';
import VacationsScreen from '../screens/employee/VacationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack para Dashboard
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Dashboard" 
      component={EmployeeDashboardScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// Stack para Fichaje
const CheckInOutStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CheckInOut" 
      component={CheckInOutScreen}
      options={{ title: 'Fichar' }}
    />
  </Stack.Navigator>
);

// Stack para Mis Registros
const RecordsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MyRecords" 
      component={MyRecordsScreen}
      options={{ title: 'Mis Registros' }}
    />
  </Stack.Navigator>
);

// Stack para Mi Horario
const ScheduleStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MySchedule" 
      component={MyScheduleScreen}
      options={{ title: 'Mi Horario' }}
    />
  </Stack.Navigator>
);

// Stack para Perfil
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Perfil' }}
    />
  </Stack.Navigator>
);

// Stack para Documentos
const DocumentsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Documents" 
      component={DocumentsScreen}
      options={{ title: 'Documentos' }}
    />
  </Stack.Navigator>
);

// Stack para Vacaciones
const VacationsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Vacations" 
      component={VacationsScreen}
      options={{ title: 'Vacaciones' }}
    />
  </Stack.Navigator>
);

const EmployeeNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'DashboardTab':
              iconName = 'view-dashboard';
              break;
            case 'CheckInOutTab':
              iconName = 'clock-check';
              break;
            case 'RecordsTab':
              iconName = 'clipboard-text';
              break;
            case 'VacationsTab':
              iconName = 'calendar-clock';
              break;
            case 'ProfileTab':
              iconName = 'account';
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
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen 
        name="CheckInOutTab" 
        component={CheckInOutStack}
        options={{ tabBarLabel: 'Fichar' }}
      />
      <Tab.Screen 
        name="RecordsTab" 
        component={RecordsStack}
        options={{ tabBarLabel: 'Registros' }}
      />
      <Tab.Screen 
        name="VacationsTab" 
        component={VacationsStack}
        options={{ tabBarLabel: 'Vacaciones' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

export default EmployeeNavigator;
