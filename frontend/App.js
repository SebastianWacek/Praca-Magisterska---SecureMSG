import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { ChatProvider } from './ChatContext';
import ChatsListScreen from './screens/ChatsListScreen';
import UsersListScreen from './screens/UsersListScreen';
import ChatScreen from './screens/ChatScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity } from 'react-native';

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#e0e0e0' },
        headerTintColor: '#333',
        headerTitleStyle: { fontWeight: 'bold' },
        headerTitleAlign: 'center',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Chats') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Users') {
            iconName = focused ? 'people' : 'people-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#f8f8f8' },
      })}
    >
      <Tab.Screen name="Chats" component={ChatsListScreen} />
      <Tab.Screen name="Users" component={UsersListScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <NavigationContainer>
        <RootStack.Navigator>
          <RootStack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen
            name="Main"
            component={MainTabs}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ navigation, route }) => ({
              headerShown: true,
              title: route.params?.other?.username || 'Czat',
              headerStyle: { backgroundColor: '#e0e0e0' },
              headerTintColor: '#333',
              headerTitleStyle: { fontWeight: 'bold' },
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  style={{ marginLeft: 15 }}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
              ),
            })}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </ChatProvider>
  );
}