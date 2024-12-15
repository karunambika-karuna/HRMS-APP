import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Alert,
 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, Entypo } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

const Profile = () => {
  const route = useRoute();
  const { empID, userID, companyID, branchID } = route.params;
  const [employeeData, setEmployeeData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [expandedPanels, setExpandedPanels] = useState({
    employeeInfo: false,
    bankDetails: false,
    contactDetails: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedImage = await AsyncStorage.getItem('profileImage');
        if (storedImage) {
          setProfileImage(storedImage);
        }
        await fetchEmployeeData();
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    };
    loadData();
  }, [empID, userID, companyID, branchID]);

  const fetchEmployeeData = async () => {
    try {
      const response = await fetch(
        `https://api.opexmetrics.com/api/Employee/EditRecord?CompanyID=${companyID}&BranchID=${branchID}&EmpID=${empID}`
      );

      if (!response.ok) {
        Alert.alert('Error', 'Failed to fetch employee data');
        return;
      }

      const data = await response.json();
      if (data && data.first_Name) {
        setEmployeeData(data);
      } else {
        Alert.alert('Error', 'No valid data found for this employee');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Error', 'An error occurred while fetching employee data');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      setProfileImage(selectedImageUri);
      await AsyncStorage.setItem('profileImage', selectedImageUri);
    }
  };

  const handleTogglePanel = (panel) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  if (!employeeData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.text}>No Employee Data Found</Text>
      </View>
    );
  }

  const renderFields = (fields) =>
    Object.entries(fields).map(([key, value]) => (
      <View style={styles.detailContainer} key={key}>
        <View style={styles.row}>
          <Text style={styles.label}>{capitalizeFirstLetter(key.replace(/_/g, ' '))}:</Text>
          <Text style={styles.data}>{value || 'N/A'}</Text>
        </View>
      </View>
    ));

  const renderSection = (title, icon, panelKey, fields) => {
    const isExpanded = expandedPanels[panelKey];
    return (
      <View style={styles.panel}>
        <TouchableOpacity onPress={() => handleTogglePanel(panelKey)}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>
              <MaterialIcons name={icon} size={24} color="gray" /> {title}
            </Text>
            <Entypo name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color="gray" />
          </View>
        </TouchableOpacity>
        {isExpanded && <Animated.View style={styles.expandedContent}>{renderFields(fields)}</Animated.View>}
      </View>
    );
  };

  const employeeDetails = {
    designation: employeeData.designation,
    grade: employeeData.grade,
    branch: employeeData.branchName,
    joiningDate: employeeData.cDate,
    depName: employeeData.depName,
    reportingManager: employeeData.reporting_Manager,
  };

  const bankDetails = {
    bankAccountHolderName: employeeData.bank_Account_Holder_Name || 'N/A',
    bankAccountNumber: employeeData.bank_Account_Number || 'N/A',
    bankIFSCCode: employeeData.bank_IFSC_Code || 'N/A',
    bankName: employeeData.bank_Name || 'N/A',
    branchLocation: employeeData.branch_Location || 'N/A',
  };

  const contactDetails = {
    email: employeeData.email || 'N/A',
    contactNo: employeeData.contactNo || 'N/A',
    altContactNo: employeeData.altContactNo || 'N/A',
    presentAddress: employeeData.present_Address || 'N/A',
    permanentAddress: employeeData.permenant_Address || 'N/A',
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <View style={styles.coverContainer}>
          <LinearGradient colors={['#fff', 'rgba(255, 255, 255, 0.5)']} style={styles.gradient} />
          <Image source={require('../assets/blonde.jpg')} style={styles.logo} resizeMode="cover" />
          <Image source={require('../assets/Oasis_logo.jpg')} style={styles.nameHeaderi} resizeMode="cover" />

          <View style={styles.nameHeader}>
            <Text style={styles.empName}>
              {employeeData.first_Name} {employeeData.last_Name}
            </Text>
            <Text style={styles.empID}>{employeeData.empID}</Text>
          </View>

          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
              <Image
                source={profileImage ? { uri: profileImage } : require('../assets/profile.png')}
                style={styles.profileImage}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
                <MaterialIcons name="edit" size={24} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.panelContainer}>
          {renderSection('My Info', 'person', 'employeeInfo', employeeDetails)}
          {renderSection('Contact Details', 'contacts', 'contactDetails', contactDetails)}
          {renderSection('Bank Details', 'account-balance', 'bankDetails', bankDetails)}
        </View>
      </ScrollView>
    </View>
  );
};

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    paddingBottom: 20,
  },
  coverContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  logo: {
    width: '150%',
    height: '150%',
    resizeMode: 'cover',
    marginTop: 50,
  },
  nameHeaderi: {
    position: 'absolute',
    top: 140, // Move up slightly if needed
    left: '20%',
    alignItems: 'center',
    transform: [{ translateX: -50 }, { scale: 0.8 }], // Scale down to 80%
    width: 130,  // Adjust width for smaller size
    height: 110, // Adjust height proportionally
    resizeMode: 'contain', // Ensures the image scales without distortion
  },
  
  nameHeader: {
    position: 'absolute',
    top: 30,  // Adjust to move the entire header up
    left: '20%',
    alignItems: 'center',
    transform: [{ translateX: -50 }],
    //marginTop:0,
  },
  empName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,  // Space between names and empID
  },
  empID: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,  // This will move the empID down
  },
  firstLetter: {
    fontSize: 22,  // Larger first letter size
    fontWeight: 'bold',
    color: 'white',
  },
  profileHeader: {
    position: 'absolute',
    bottom: -160,
    left: '20%',
    transform: [{ translateX: -50 }],
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'orange',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editIcon: {
    position: 'absolute',
    top: '75%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    padding: 4,
  },
  panelContainer: {
    marginTop: 180,
    padding: 10,
  },
  panel: {
    marginBottom: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'orange',
  },
  expandedContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'grey',
  },
  data: {
    fontSize: 16,
    color: 'grey',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
export default Profile;