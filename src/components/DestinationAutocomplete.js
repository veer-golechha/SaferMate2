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
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Goa',
  'Udaipur',
  'Agra',
  'Varanasi',
  'Rishikesh',
  'Manali',
  'Shimla',
  'Ooty',
  'Coorg',
  'Darjeeling',
  'Gangtok',
  'Srinagar',
  'Leh',
  'Amritsar',
  'Jodhpur',
  'Mysore',
  'Kochi',
  'Munnar',
  'Andaman and Nicobar Islands',
  'Lakshadweep',
  'Guwahati',
  'Shillong',
  'Cherrapunji',
  'Kaziranga',
  'Rameswaram',
  'Madurai',
  'Tirumala',
  'Haridwar',
  'Pushkar',
  'Mount Abu',
  'Lonavala',
  'Mahabaleshwar',
  'Nainital',
  'Mussoorie',
  'McLeod Ganj',
  'Khajuraho',
  'Hampi',
  'Pondicherry',
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
    if (value && value.length >= 2) {
      const filtered = POPULAR_DESTINATIONS.filter(dest =>
        dest.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5); // Show max 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  const handleSelect = (destination) => {
    onChangeText(destination);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding to allow tap on suggestion
    setTimeout(() => setShowSuggestions(false), 200);
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
    zIndex: 1001,
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
