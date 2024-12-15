import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
//import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
const Buttons = () => {
  const [profileImage, setProfileImage] = useState(null); // State for profile image
  const [employeeData, setEmployeeData] = useState(null); // State for employee data
  const [loading, setLoading] = useState(true); // Loading state

  const navigation = useNavigation();
  const route = useRoute();
  const { empID, userID,companyID,branchID,empCode } = route.params || {}; // Get route params

  const defaultProfileImage = require('../assets/profile.png'); // Default image

  // Load profile image and fetch employee data on mount
  useEffect(() => {
    loadProfileImageFromStorage();
    fetchEmployeeData(); // Fetch employee data on component mount
  }, []);

  // Load profile image from AsyncStorage
  const loadProfileImageFromStorage = async () => {
    try {
      const storedImage = await AsyncStorage.getItem('profileImage');
      if (storedImage) setProfileImage(storedImage);
    } catch (error) {
      console.error('Error loading profile image:', error);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  // Fetch employee data from API
  const fetchEmployeeData = async () => {
    try {
      const response = await fetch(
        `https://api.opexmetrics.com/api/Employee/EditRecord?CompanyID=1&BranchID=1&EmpID=${empID}`
      );

      if (!response.ok) {
        Alert.alert('Error', 'Failed to fetch employee data');
        return;
      }

      const data = await response.json();
      //console.log('Fetched Data:', data); // Debugging log

      if (data && data.first_Name) {
        setEmployeeData(data); // Set employee data
      } else {
        Alert.alert('Error', 'No valid data found for this employee');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Error', 'An error occurred while fetching employee data');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Button handlers
  const handleAttendance = () => navigation.navigate('Attendance', { empID, userID,companyID,branchID,empCode });
  const handleLeaveRequest = () => navigation.navigate('LeaveRequest',{ empID, userID,companyID,branchID,empCode });
 // const handleMessage = () => navigation.navigate('Message');
  const handleProfile = () => navigation.navigate('Profile', { empID, userID,companyID,branchID });

  // Conditional rendering while data is loading
  if (loading) {
    return <ActivityIndicator size="large" color="#000" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      {/* Cover Image */}
      <Image source={require('../assets/girls.jpeg')} style={styles.coverImage} />

      {/* Profile Image */}
      <Image
        source={profileImage ? { uri: profileImage } : defaultProfileImage}
        style={styles.profileImage}
      />

      {/* Welcome and Employee Name */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome!</Text>
        <Text style={styles.employeeName}>
          {employeeData
            ? `${employeeData.first_Name} ${employeeData.last_Name}`
            : 'No Data Available'}
        </Text>
      </View>

      {/* Attendance Button */}
      <TouchableOpacity style={styles.attendanceButton} onPress={handleAttendance}>
        <Text style={styles.attendanceButtonText}>Punch Attendance</Text>
      </TouchableOpacity>

      {/* Horizontal Buttons
      <View style={styles.horizontalButtonContainer}>
        <TouchableOpacity style={styles.numberButton}>
          <Text style={styles.numberButtonText}>2</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.numberButton3}>
          <Text style={styles.numberButtonText}>3</Text>
        </TouchableOpacity>
      </View> */}

      {/* Pagination */}
      <View style={styles.pagination}>
        <TouchableOpacity onPress={handleLeaveRequest}>
          <MaterialIcons name="format-line-spacing" size={30} color="#888" />
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={handleMessage}>
          <MaterialIcons name="message" size={30} color="#888" />
        </TouchableOpacity> */}
        <TouchableOpacity onPress={handleProfile}>
          <MaterialIcons name="person" size={30} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 230,
    borderColor: 'orange',
    borderWidth: 2,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'orange',
  },
  employeeName: {
    fontSize: 18,
    marginTop: 5,
    fontWeight: 'bold',
  },
  attendanceButton: {
    backgroundColor: '#f58d12',
    height: 90,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
    width: '90%',
    marginBottom: 65,
  },
  attendanceButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  horizontalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
    marginBottom: 30,
  },
  numberButton: {
    backgroundColor: '#d6210c',
    height: 100,
    width: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -60,
  },
  numberButton3: {
    backgroundColor: '#0cd686',
    height: 100,
    width: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -60,
  },
  numberButtonText: {
    color: '#fff',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    position: 'absolute',
    bottom: 20,
    padding: 10,
  },
});

export default Buttons;
