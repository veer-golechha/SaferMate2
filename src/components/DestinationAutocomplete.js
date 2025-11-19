import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { COLORS } from '../constants/colors';

// Popular Indian destinations
const POPULAR_DESTINATIONS = [
  // Metro Cities
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Ahmedabad',
  
  // Major Cities
  'Jaipur',
  'Surat',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Thane',
  'Bhopal',
  'Visakhapatnam',
  'Patna',
  'Vadodara',
  'Ghaziabad',
  'Ludhiana',
  'Agra',
  'Nashik',
  'Faridabad',
  'Meerut',
  'Rajkot',
  'Kalyan-Dombivli',
  'Vasai-Virar',
  'Varanasi',
  'Srinagar',
  'Aurangabad',
  'Dhanbad',
  'Amritsar',
  'Navi Mumbai',
  'Allahabad',
  'Ranchi',
  'Howrah',
  'Coimbatore',
  'Jabalpur',
  'Gwalior',
  'Vijayawada',
  'Jodhpur',
  'Madurai',
  'Raipur',
  'Kota',
  'Chandigarh',
  'Guwahati',
  
  // Tourist Destinations
  'Goa',
  'Udaipur',
  'Rishikesh',
  'Manali',
  'Shimla',
  'Ooty',
  'Coorg',
  'Darjeeling',
  'Gangtok',
  'Leh',
  'Munnar',
  'Mussoorie',
  'Nainital',
  'Mount Abu',
  'Lonavala',
  'Mahabaleshwar',
  'Kodaikanal',
  'Khajuraho',
  'Hampi',
  'Pondicherry',
  'Mysore',
  'Kochi',
  'Andaman and Nicobar Islands',
  'Lakshadweep',
  'Shillong',
  'Cherrapunji',
  'Kaziranga',
  'Rameswaram',
  'Tirumala',
  'Haridwar',
  'Pushkar',
  'McLeod Ganj',
  'Dharamshala',
  'Kasol',
  'Spiti Valley',
  'Ladakh',
  'Auli',
  'Lansdowne',
  'Ranikhet',
  'Almora',
  'Kausani',
  'Dalhousie',
  'Kullu',
  'Kasauli',
  'Chail',
  'Bir Billing',
  'Tirthan Valley',
  
  // Other Important Cities
  'Thiruvananthapuram',
  'Bhubaneswar',
  'Pimpri-Chinchwad',
  'Solapur',
  'Tiruchirappalli',
  'Salem',
  'Tiruppur',
  'Moradabad',
  'Mysuru',
  'Bareilly',
  'Aligarh',
  'Jalandhar',
  'Bhubaneshwar',
  'Warangal',
  'Guntur',
  'Bhiwandi',
  'Saharanpur',
  'Gorakhpur',
  'Bikaner',
  'Amravati',
  'Noida',
  'Jamshedpur',
  'Bhilai',
  'Cuttack',
  'Firozabad',
  'Kochi',
  'Nellore',
  'Bhavnagar',
  'Dehradun',
  'Durgapur',
  'Asansol',
  'Rourkela',
  'Nanded',
  'Kolhapur',
  'Ajmer',
  'Akola',
  'Gulbarga',
  'Jamnagar',
  'Ujjain',
  'Loni',
  'Siliguri',
  'Jhansi',
  'Ulhasnagar',
  'Jammu',
  'Sangli-Miraj & Kupwad',
  'Mangalore',
  'Erode',
  'Belgaum',
  'Ambattur',
  'Tirunelveli',
  'Malegaon',
  'Gaya',
  'Jalgaon',
  'Udaipur',
  'Maheshtala',
  'Davanagere',
  'Kozhikode',
  'Kurnool',
  'Rajpur Sonarpur',
  'Rajahmundry',
  'Bokaro',
  'South Dumdum',
  'Bellary',
  'Patiala',
  'Gopalpur',
  'Agartala',
  'Bhagalpur',
  'Muzaffarnagar',
  'Bhatpara',
  'Panihati',
  'Latur',
  'Dhule',
  'Tirupati',
  'Rohtak',
  'Korba',
  'Bhilwara',
  'Berhampur',
  'Muzaffarpur',
  'Ahmednagar',
  'Mathura',
  'Kollam',
  'Avadi',
  'Kadapa',
  'Kamarhati',
  'Sambalpur',
  'Bilaspur',
  'Shahjahanpur',
  'Satara',
  'Bijapur',
  'Rampur',
  'Shivamogga',
  'Chandrapur',
  'Junagadh',
  'Thrissur',
  'Alwar',
  'Bardhaman',
  'Kulti',
  'Kakinada',
  'Nizamabad',
  'Parbhani',
  'Tumkur',
  'Khammam',
  'Ozhukarai',
  'Bihar Sharif',
  'Panipat',
  'Darbhanga',
  'Bally',
  'Aizawl',
  'Dewas',
];

const DestinationAutocomplete = ({ 
  value, 
  onChangeText, 
  placeholder, 
  error,
  style 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value && value.length >= 2 && isFocused) {
      const filtered = POPULAR_DESTINATIONS.filter(dest =>
        dest.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5); // Show max 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, isFocused]);

  const handleSelect = (destination) => {
    onChangeText(destination);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding to allow tap on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          isFocused && styles.inputFocused
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textGray}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView 
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {suggestions.map((destination, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.suggestionItem,
                  index === suggestions.length - 1 && styles.suggestionItemLast
                ]}
                onPress={() => handleSelect(destination)}
              >
                <Text style={styles.suggestionIcon}>📍</Text>
                <Text style={styles.suggestionText}>{destination}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  input: {
    height: 54,
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 200,
    zIndex: 2000,
    elevation: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
  },
});

export default DestinationAutocomplete;
