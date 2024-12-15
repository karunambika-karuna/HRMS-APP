import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  ScrollView, StyleSheet
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Checkbox } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';

const LeaveRequest = () => {
  const navigation = useNavigation(); 
  const route = useRoute();
  const { empID, companyID, branchID } = route.params;
  const [isWeekendSelected, setIsWeekendSelected] = useState(false); 
  const [days, setDays] = useState(0); 
  const [leaveCategories, setLeaveCategories] = useState([]); 
  const [category, setCategory] = useState(''); 
  const [leaveType, setLeaveType] = useState(''); 
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [reason, setReason] = useState(''); 
  const [companyName, setCompanyName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [empName, setEmpName] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await axios.get(
          `https://api.opexmetrics.com/api/Employee/EditRecord?CompanyID=${companyID}&BranchID=${branchID}&EmpID=${empID}`
        );
        const data = response.data;

        if (response.status === 200) {
          setCompanyName(data.companyName || '');
          setBranchName(data.branchName || '');
          setEmpName(data.first_Name || '');
          setEmpCode(data.empCode || '');
        } else {
          Alert.alert('Error', 'Failed to fetch employee details.');
        }
      } catch (error) {
        console.error('Error fetching employee details:', error);
        Alert.alert('Error', 'Unable to load employee details.');
      }
    };
    fetchEmployeeDetails();
  }, [companyID, branchID, empID]);

  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return date;
  };

  const fetchLeaveCategories = async () => {
    console.log('fetchLeaveCategories called'); // Log function entry
    try {
        const response = await fetch(
            `https://api.opexmetrics.com/api/Dropdown/ddlLeaveTypes_ByEmpCode?EmpCode=${empCode}`
        );
        console.log('API response status:', response.status); // Log response status

        const data = await response.json();
        console.log('Fetched data:', data); // Log fetched data

        if (response.ok) {
            const formattedData = data.map((item) => ({
                label: item.text,
                value: item.value,
            }));
            console.log('Formatted data:', formattedData); // Log formatted data
            setLeaveCategories(formattedData);
        } else {
            Alert.alert('Error', 'Failed to fetch leave categories.');
        }
    } catch (error) {
        console.error('Error fetching leave categories:', error); // Log errors
        Alert.alert('Error', 'An error occurred while fetching leave categories.');
    }
};

useEffect(() => {
    console.log('useEffect triggered with empCode:', empCode); // Log when useEffect is triggered
    if (empCode) {
        fetchLeaveCategories();
    }
}, [empCode]);

const handleCategoryChange = (value) => {
    console.log('Category changed to:', value); // Log category changes
    setCategory(value);
};

  useEffect(() => {
    calculateDays();
  }, [leaveType, startDate, endDate, isHalfDay]);

  const toggleStartDatePicker = () => setShowStartDatePicker(prev => !prev);
  const toggleEndDatePicker = () => setShowEndDatePicker(prev => !prev);

  // Check if the selected date is a weekend
  const checkIfWeekend = (date) => {
    const day = moment(date).day();
    return day === 6 || day === 0; // Saturday or Sunday
  };

  const onStartDateChange = (_, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      if (checkIfWeekend(selectedDate)) {
        Alert.alert('Weekend', 'Start date cannot be on a weekend.');
        setIsWeekendSelected(true);
      } else {
        setStartDate(selectedDate);
        setIsWeekendSelected(false);
      }
    }
  };

  const onEndDateChange = (_, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      if (checkIfWeekend(selectedDate)) {
        Alert.alert('Weekend', 'End date cannot be on a weekend.');
        setIsWeekendSelected(true);
      } else if (startDate && selectedDate <= startDate) {
        Alert.alert('Invalid Date', 'End date must be greater than the start date.');
      } else {
        setEndDate(selectedDate);
        setIsWeekendSelected(false);
      }
    }
  };

  // Calculate the number of days
  const calculateDays = () => {
    if (leaveType === 'Multiple' && startDate && endDate) {
      let totalDays = 0;
      let excludedWeekends = 0;
      const start = moment(startDate);
      const end = moment(endDate);

      for (let date = start.clone(); date.diff(end, 'days') <= 0; date.add(1, 'days')) {
        if (date.day() === 6 || date.day() === 0) {
          excludedWeekends++;
        } else {
          totalDays++;
        }
      }

      setDays(totalDays);

      if (excludedWeekends > 0) {
        Alert.alert('Weekend Excluded', `${excludedWeekends} weekend days were excluded.`);
      }
    } else {
      setDays(isHalfDay ? 0.5 : 1);
    }
  };

  // Automatically recalculate days whenever necessary
  useEffect(() => {
    calculateDays();
  }, [leaveType, startDate, endDate, isHalfDay]);

  // Reset the form
  const resetForm = () => {
    setLeaveType('Single');
    setStartDate(new Date());
    setEndDate(new Date());
    setDays(0);
    setIsHalfDay(false);
    setReason('');
    setIsWeekendSelected(false);
  };
  const onSubmitLeave = async () => {
    if (!leaveType || !reason.trim()|| !leaveCategories) {
      Alert.alert('Validation Error', 'Please fill all the required fields.');
      return;
    }
    if (isWeekendSelected) {
      Alert.alert('Error', 'Cannot submit leave request with weekends included.');
      return;
    }
    const getCurrentDate = () => {
      const today = new Date();
      return today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const lv = {
      leaveType,
      fromDate: getCurrentDate(startDate),
      toDate: leaveType === 'Multiple' ? getCurrentDate(endDate) : getCurrentDate(startDate),
      nod: isHalfDay ? '0.5' : days.toString(),
      half_Day: isHalfDay ? 'Yes' : 'No',
      leaveCategoryID: category,
      leaveCategory: leaveCategories.find(cat => cat.value === category)?.label || '',
      reason,
      appliedOn: getCurrentDate(Date()),
      empID,
      empName,
      branchID,
      branchName,
      companyID,
      companyName
    };
    console.log(lv);

    try {
      const response = await axios.post(
        'https://api.opexmetrics.com/api/LeaveRequest/Create',
        lv,
        { headers: { 'Content-Type': 'application/json', Accept: 'text/plain' } }
      );
      if (response.status === 200) {
        Alert.alert(
          'Success',
          'Leave request submitted successfully.',
          [
            { text: 'Edit', onPress: () => {}, style: 'cancel' },
            { text: 'OK', onPress: () => { 
                resetForm();
                navigation.navigate('Welcome'); 
            } },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to submit leave request.');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      Alert.alert('Error', 'An error occurred while submitting the leave request.');
    }
  };


return (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.outerContainer}>
      <Text style={styles.heading}>Leave Request Form</Text>
      <View style={styles.formContainer}>
        {/* Leave Type Picker */}
        <Text style={styles.label}>Leave Type :</Text>
        <Picker
          selectedValue={leaveType}
          onValueChange={setLeaveType}
          style={styles.picker}
        >
          <Picker.Item label="Select Leave Type" value="" />
          <Picker.Item label="Single" value="Single" />
          <Picker.Item label="Multiple" value="Multiple" />
        </Picker>

        {leaveType !== 'Multiple' && (
  <>
    <Text style={styles.label}>Half Day :</Text>
    <View style={styles.checkboxContainer}>
      <Checkbox
        status={isHalfDay ? 'checked' : 'unchecked'}
        onPress={() => {
          setIsHalfDay(!isHalfDay);
          // When half-day is checked, set leaveType to 'Single'
          // When it's unchecked, leaveType should stay 'Single' or revert accordingly
          if (!isHalfDay) {
            setLeaveType('Single');
          }
        }}
      />
      <Text style={styles.checkboxLabel}>Mark half day</Text>
    </View>
  </>
)}


          
        <Text style={styles.label}>Leave Category:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={handleCategoryChange}
            style={styles.picker}
          >
            <Picker.Item label="Select Leave Category" value="" style={styles.placeholder} />
            {leaveCategories.map((cat) => (
              <Picker.Item key={cat.value} label={cat.label} value={cat.value} style={styles.option} />
            ))}
          </Picker>
        </View>

        {/* Start Date Picker */}
        <Text style={styles.label}>Start Date :</Text>
        <TouchableOpacity onPress={toggleStartDatePicker} style={styles.dateBox}>
          <Icon name="calendar" size={20} color="#333" />
          <Text style={styles.dateText}>{formatDate(startDate)}</Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onStartDateChange}
          />
        )}

        {/* End Date Picker (Visible if Multiple Leave is selected) */}
        {leaveType === 'Multiple' && (
          <>
            <Text style={styles.label}>End Date :</Text>
            <TouchableOpacity onPress={toggleEndDatePicker} style={styles.dateBox}>
              <Icon name="calendar" size={20} color="#333" />
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onEndDateChange}
              />
            )}
          </>
        )}

        {/* Number of Days */}
        <Text style={styles.label}>Number of Days: {days}</Text>

        {/* Reason Input */}
        <Text style={styles.label}>Reason :</Text>
        <TextInput
          multiline
          numberOfLines={4}
          style={styles.reasonInput}
          onChangeText={setReason}
          value={reason}
          placeholder="Enter the reason for your leave request..."
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!leaveType || !reason.trim()) && styles.submitButtonDisabled,
          ]}
          onPress={onSubmitLeave}
          disabled={!leaveType || !reason.trim()}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>
);
};
const styles = StyleSheet.create({
  scrollContainer: {
  flexGrow: 1,
  flex:1,
  padding: 20,
  backgroundColor: '#f4f4f4',
  },
  outerContainer: {
  alignItems: 'center',
  },
  heading: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 20,
  },
  formContainer: {
  width: '100%',
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 5,
  elevation: 3,
  },
  label: {
  fontSize: 16,
  fontWeight: '600',
  marginVertical: 8,
  color: '#555',
  },
  picker: {
  height: 50,
  backgroundColor: '#f0f0f0',
  borderRadius: 5,
  marginBottom: 10,
  },
  checkboxContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 8,
  },
  checkboxLabel: {
  fontSize: 16,
  color: '#555',
  marginLeft: 8,
  },
  dateBox: {
  padding: 12,
  backgroundColor: '#f0f0f0',
  borderRadius: 5,
  alignItems: 'center',
  marginBottom: 10,
  },
  reasonInput: {
  height: 80,
  borderColor: 'orange',
  borderWidth: 1,
  borderRadius: 5,
  padding: 10,
  backgroundColor: '#f9f9f9',
  textAlignVertical: 'top',
  marginBottom: 20,
  },
  submitButton: {
  backgroundColor: 'orange',
  padding: 15,
  borderRadius: 5,
  alignItems: 'center',
  marginTop: 10,
  },
  submitButtonDisabled: {
  backgroundColor: '#B0B0B0',
  },
  submitButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
  },
  });
  export default LeaveRequest;