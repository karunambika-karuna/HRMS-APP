import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Import NavigationContainer
import { createStackNavigator } from '@react-navigation/stack';
import Welcome from './Welcome'; // Adjust the import path as needed
import Buttons from './Buttons'; // Adjust the import path as needed
import Profile from './Profile';
import Attendance from './Attendance';
import Message from './Message';

import LeaveRequest from './LeaveRequest';

const Stack = createStackNavigator();

export default function App() {
  return (
   
    
      <Stack.Navigator initialRouteName="Welcome"> 
        <Stack.Screen name=" " component={Welcome} /> 
        <Stack.Screen name="   " component={Buttons} />
        <Stack.Screen name="         " component={Message} />
        <Stack.Screen name="    " component={Profile} />
        <Stack.Screen name="      " component={Attendance} />
        <Stack.Screen name="        " component={LeaveRequest} />
      </Stack.Navigator>
      
  );
}
