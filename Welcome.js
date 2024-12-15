import 'react-native-gesture-handler';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { useNavigation } from '@react-navigation/native';




const Welcome = () => {
  const navigation = useNavigation(); // Use useNavigation hook to get navigation
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
    const togglePasswordVisibility = () => {
      setIsPasswordVisible((prev) => !prev);
    };
  
    const payload = {
      userName: username.trim(),
      password: password.trim(),
    };
  
    const handleLogin = async () => {
      setIsButtonPressed(true);
    
      try {
        const response = await axios.post(
          'https://api.opexmetrics.com/api/Login/Login',
          payload
        );
    
        if (response.status === 200 && response.data[0]?.token) {
          const { empID, userID, companyID, branchID, empCode } = response.data[0];
    
          setIsLoggedIn(true);
    
          // Redirect to Buttons screen with route params after successful login
          navigation.navigate('Buttons', {
            empID,
            userID,
            companyID,
            branchID,
            empCode,
          });
    
          // Optional animation for success message
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        } else {
          Alert.alert('Login Failed', 'Invalid username or password.');
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error:', error);
        const errorMessage =
          error.response?.data?.message || 'An error occurred. Please try again.';
        Alert.alert('Error', errorMessage);
        setIsLoggedIn(false);
      } finally {
        setIsButtonPressed(false);
      }
    };
  

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/Oasis_logo.jpg')} style={styles.logo} />
      </View>

      <Image source={require('../assets/Oasis-India-cover.jpg')} style={styles.coverImage} />

      <KeyboardAvoidingView behavior="padding" style={styles.loginContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={24} color="grey" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color="grey" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={(text) => setPassword(text)}
          />
         <TouchableOpacity onPress={togglePasswordVisibility}>
  <Ionicons
    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
    size={24}
    color="grey"
  />
</TouchableOpacity>

        </View>

        <TouchableOpacity
          style={[styles.button, isButtonPressed && styles.buttonPressed]}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <Text style={styles.hrmText}>HRM software</Text>
      <Text style={styles.copyrightText}>
        By <Text style={styles.highlightedText}>Crisolite Solutions</Text>
      </Text>
    </View>
  );
};






const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 50,
  },
  logoContainer: {
    position: 'absolute',
    top: 30,
    alignSelf: 'center',
  },
  logo: {
    width: 170,
    height: 170,
    resizeMode: 'contain',
    zIndex: 2,
  },
  coverImage: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    bottom: 100,
    opacity: 0.1,
    resizeMode: 'cover',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: -120,
    borderColor: '#ddd',
    borderWidth: 1,
    height: 50,
    marginTop: 135,
  },
  loginContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    height: '55%',
    elevation: 9,
    marginTop: 30,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
  },
  button: {
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 150,
    width: '45%',
    right: -65,
    borderColor: '#ef6f0f',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  buttonPressed: {
    backgroundColor: '#ef6f0f',
  },
  buttonText: {
    color: '#ef6f0f',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hrmText: {
    textAlign: 'center',
    marginTop: 150,
    fontSize: 18,
    color: 'gray',
  },
  copyrightText: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 16,
    color: '#ef6f0f',
  },
  highlightedText: {
    color: '#ef6f0f',
    fontWeight: 'bold',
  },
  successMessage: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#4BB543',
    padding: 10,
    borderRadius: 5,
  },
  successMessageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
export default Welcome;