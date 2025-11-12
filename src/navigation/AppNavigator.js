import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginSelectionScreen from '../screens/auth/LoginSelectionScreen';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';
import EmployeeLoginScreen from '../screens/auth/EmployeeLoginScreen';

// Main Screens
import AdminNavigator from './AdminNavigator';
import EmployeeNavigator from './EmployeeNavigator';

// Loading
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="LoginSelection" component={LoginSelectionScreen} />
            <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
            <Stack.Screen name="EmployeeLogin" component={EmployeeLoginScreen} />
          </>
        ) : (
          // Main App Stack
          <>
            {isAdmin ? (
              <Stack.Screen name="AdminApp" component={AdminNavigator} />
            ) : (
              <Stack.Screen name="EmployeeApp" component={EmployeeNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
