import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../theme/colors';

// Employee Screens
import CalendarScreen from '../screens/employee/CalendarScreen';
import CheckInOutScreen from '../screens/employee/CheckInOutScreen';
import RequestAbsenceScreen from '../screens/employee/RequestAbsenceScreen';
import MyScheduleScreen from '../screens/employee/MyScheduleScreen';
import DocumentsScreen from '../screens/employee/DocumentsScreen';
import ProfileScreen from '../screens/employee/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack para Calendario
const CalendarStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Calendar" 
      component={CalendarScreen}
      options={{ title: 'Mi Calendario' }}
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

// Stack para Solicitar Ausencia
const RequestAbsenceStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="RequestAbsence" 
      component={RequestAbsenceScreen}
      options={{ title: 'Solicitar Ausencia' }}
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

// Stack para Perfil
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Mi Perfil' }}
    />
  </Stack.Navigator>
);

const EmployeeNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'CalendarTab':
              iconName = 'calendar-month';
              break;
            case 'CheckInOutTab':
              iconName = 'clock-check';
              break;
            case 'RequestAbsenceTab':
              iconName = 'calendar-plus';
              break;
            case 'ScheduleTab':
              iconName = 'timetable';
              break;
            case 'DocumentsTab':
              iconName = 'file-document-multiple';
              break;
            case 'ProfileTab':
              iconName = 'account-circle';
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
        name="CalendarTab" 
        component={CalendarStack}
        options={{ tabBarLabel: 'Calendario' }}
      />
      <Tab.Screen 
        name="CheckInOutTab" 
        component={CheckInOutStack}
        options={{ tabBarLabel: 'Fichar' }}
      />
      <Tab.Screen 
        name="RequestAbsenceTab" 
        component={RequestAbsenceStack}
        options={{ tabBarLabel: 'Ausencia' }}
      />
      <Tab.Screen 
        name="ScheduleTab" 
        component={ScheduleStack}
        options={{ tabBarLabel: 'Horario' }}
      />
      <Tab.Screen 
        name="DocumentsTab" 
        component={DocumentsStack}
        options={{ tabBarLabel: 'Docs' }}
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
