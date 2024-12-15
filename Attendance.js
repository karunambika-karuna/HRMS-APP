import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as FaceDetector from 'expo-face-detector';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';


const Attendance = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { empID, userID, companyID, branchID } = route.params || {};
  const [date, setDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [time, setTime] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [remarks, setRemarks] = useState(''); // Remarks with full address
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [location, setLocation] = useState('');
  const [profileImage, setProfileImage] = useState(null);
 
  const [companyName, setCompanyName] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [empName, setEmpName] = useState('');
  const [fullAddress, setFullAddress] = useState(''); // Full address fetched from location API


  const [formattedTime, setFormattedTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  );
  
  const [address, setAddress] = useState('');
 
  // Set Google API key for location
  Location.setGoogleApiKey("AIzaSyASgqBWzXi628zwe5DbUW_6iFtFf4zwqME");
  useEffect(() => {
    const getPermissionsAndDate = async () => {
      try {
        // Request location and camera permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        
        if (status !== 'granted' || cameraStatus !== 'granted') {
          alert("Permissions required", "Please grant location and camera permissions.");
          return;
        }
  
        // You can add more logic here if needed
  
      } catch (error) {
        console.error("Error requesting permissions:", error);
      }
    };
  
    getPermissionsAndDate(); // Invoke the function
  }, []); // Dependency array
  useEffect(() => {
    // Enable the button only if all required details are present
    setIsButtonDisabled(!(empID && date && time && location));
  }, [empID, date, time, location]);
  

  const requestPermissions = async () => {
    const hasPermissions = await Location.requestForegroundPermissionsAsync();
    const servicesEnabled = await checkLocationServices();
  
    if (hasPermissions.status !== 'granted' || !servicesEnabled) {
      Alert.alert('Error', 'Permission to access location or location services was denied.');
      return false;
    }
    return true;
  };
  
  const checkLocationServices = async () => {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      alert('Please enable location services');
    }
    return servicesEnabled;
  };
    
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await fetch(
          `https://api.opexmetrics.com/api/Employee/EditRecord?CompanyID=${companyID}&BranchID=${branchID}&EmpID=${empID}`
        );
        const data = await response.json();
        if (response.ok) {
          setCompanyName(data.companyName || '');
          setBranchName(data.branchName || '');
          setEmpName(data.first_Name || '');
          setEmpCode(data.empCode || '');
        } else {
          Alert.alert('Error', 'Failed to fetch employee details.');
        }
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };
    
    if (empID && companyID && branchID) {
      fetchEmployeeDetails();
    }
  }, [empID, companyID, branchID]);
  // Format date part (ensure formatDate function is defined for your needs)
const formatDate = (date) => date.toLocaleDateString('en-US'); // or use a
 
  
  
  const detectFace = async (imageUri) => {
    try {
      const { faces } = await FaceDetector.detectFacesAsync(imageUri, {
        mode: FaceDetector.FaceDetectorMode.fast,
      });
      if (faces && faces.length > 0) {
        fetchLocation();
      } else {
        Alert.alert('Error', 'No face detected. Please take a  clear face selfie.');
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }
  };
  const takeSelfie = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({ quality: 1 });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        detectFace(uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };
  const fetchLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const [addressData] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
  
      const street = addressData.street || '';
      const city = addressData.city || '';
      const region = addressData.region || '';
      const country = addressData.country || '';
  
      const fullAddress = formatAddress(street, city, region, country); // Full address for remarks
      const shortAddress = getStreetAndCity(street, city); // Only street and city for location
  
      console.log('Full Address for Remarks:', fullAddress);
      console.log('Short Address for Location:', shortAddress);
  
      setAddress(fullAddress); // For full address display
      handleAddressUpdate(fullAddress); // Full address for remarks
      setLocation(shortAddress); // Street and city only for location
    } catch (error) {
      console.error('Location error:', error);
    }
  };
  //Helper function to format address based on available components
const formatAddress = (street, city, region, country) => {
  return `${street ? street + ', ' : ''}${city ? city + ', ' : ''}${region ? region + ', ' : ''}${country}`.replace(/,\s*$/, '');
};


  // Function to set addresses in state
  const handleAddressUpdate = (address) => {
    console.log("Handling Address Update:", address); // Debug log to check address being passed
    setFullAddress(address);
    setLocation(getStreetAndCity(address)); // Set location with only street and city
    setRemarks(address); // Set remarks with the full address
  };
  
  
const getStreetAndCity = (street, city) => {
  return street ? `${street}, ${city}` : city; // Include city only if street is empty
};
  
  useEffect(() => {
    const formattedDate = formatDate(date); // format the date only when it changes
    setFormattedDate(formattedDate);
  }, [date]); // This runs only when the date changes
  
  useEffect(() => {
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    setFormattedTime(formattedTime); // Set formatted time with AM/PM when `date` changes
  }, [date]);
  // This runs only when the date changes
  const resetForm = () => {
  setLocation(null);
  //// setCompanyID(null); // if applicable
   setCompanyName(null); // if applicable
  // setBranchID(null); // if applicable
   setBranchName(null); // if applicable
   setEmpCode(null); // if applicable
   setEmpName(null); // if applicable
   setReason(null); // if applicable
   setAddress(null); // if applicable
   setRemarks(null);
   setProfileImage(null);
  }
const handlePunchAttendance = async () => {
  if (!empID || !date || !time ||!location) {
    Alert.alert('Error', 'Complete all fields before punching attendance.');
    return;
  }
  const punchDateTime24Hour = `${
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
} ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
const getCurrentDate = () => {
  const today = new Date();
  return today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
  const attendanceData = {
    attDate: getCurrentDate(date),
    punchTime: punchDateTime24Hour,
    companyID,
    companyName,
    branchID,
    branchName,
    empName,
    empCode,
    location,
    reason:" ",
    halfDay:" ",
    attFlag: 'P',
    attType: 'mobile',
    remarks: address,
  };
  console.log(attendanceData);
  try {
    const { status } = await axios.post(
      'https://api.opexmetrics.com/api/Attendance/Create_MA',
      attendanceData,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/plain',
        },
      }
    );
 // console.log(attendanceData);
    if (status === 200) {
      
      Alert.alert(
        'Success',
        'Attendance marked successfully.',
        [
        
          { text: 'OK', onPress: () => { 
              resetForm();
              navigation.navigate('Welcome'); 
          } },
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to submit attendance.');
    }
  } catch (error) {
    console.log(attendanceData);
    console.error('Error submitting leave request:', error);
    Alert.alert('Error', 'An error occurred while submitting the leave request.');
  }
};

return (
  <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.header}>ATTENDANCE</Text>

        {/* Profile Icon and Click Here to Upload Selfie */}
        <View style={styles.profileContainer}>
          <TouchableOpacity style={styles.profileIcon} onPress={takeSelfie}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.image} />
            ) : (
              <Icon name="camera-alt" size={30} color="gray" />
            )}
          </TouchableOpacity>
          <Text style={styles.uploadText}>Tap above to take selfie</Text>
        </View>

        {/* Attendance Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.infoValue}>{formattedDate}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Punch Date:</Text>
          <Text style={styles.infoValue}>{formattedDate}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.infoValue}>{formattedTime}</Text>
        </View>

        {/* <View style={styles.infoContainer}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.infoValue}>{location || 'Not fetched yet'}</Text>
        </View> */}

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Location :</Text>
          <Text style={styles.infoValue}>{remarks || 'Not fetched yet'}</Text>
        </View>

        {/* Punch Attendance Button */}
        <TouchableOpacity
      style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
      onPress={handlePunchAttendance}
      disabled={isButtonDisabled}
    >
      <Text style={styles.buttonText}>Punch Attendance</Text>
    </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Styles
const styles = {
  container: {
    flexGrow: 1,
    justifyContent: 'center', // Vertically center content
    alignItems: 'center', // Horizontally center content
    padding: 16,
  },
  innerContainer: {
    width: '100%',
    maxWidth: 400, // Limit the width of the form
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3, // Add shadow for iOS/Android
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center', // Center header text
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 14,
    color: 'orange', // Blue color for the link
    textDecorationLine: 'underline',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    width: '100%',
  },
  label: {
    fontWeight: 'bold',
    width: '30%',
  },
  infoValue: {
    width: '70%',
  },
  button: {
    backgroundColor:'#f58d12',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: 'gray',
  },
};


export default Attendance;