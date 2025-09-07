import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import EventsScreen from '../screens/EventsScreen';
import MyEventsScreen from '../screens/MyEventsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import { MaterialIcons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const EventsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="EventsList" 
      component={EventsScreen} 
      options={{ title: 'Events' }}
    />
    <Stack.Screen 
      name="EventDetail" 
      component={EventDetailScreen} 
      options={{ title: 'Event Details' }}
    />
  </Stack.Navigator>
);

const MyEventsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MyEventsList" 
      component={MyEventsScreen} 
      options={{ title: 'My Events' }}
    />
    <Stack.Screen 
      name="Feedback" 
      component={FeedbackScreen} 
      options={{ title: 'Give Feedback' }}
    />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Events') {
          iconName = 'event';
        } else if (route.name === 'MyEvents') {
          iconName = 'bookmark';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }

        return <MaterialIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#3b82f6',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="Events" 
      component={EventsStack} 
      options={{ headerShown: false }}
    />
    <Tab.Screen 
      name="MyEvents" 
      component={MyEventsStack} 
      options={{ headerShown: false }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { student, loading } = useAuth();

  console.log('🧭 AppNavigator - Loading:', loading, 'Student:', !!student, 'Student ID:', student?._id);
  console.log('🔍 Full student object:', student);

  if (loading) {
    console.log('⏳ Showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  console.log('🎯 Rendering navigation - Student exists:', !!student);
  console.log('🎯 Student value:', student);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {student ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default AppNavigator;
