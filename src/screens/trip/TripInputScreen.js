import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { LANGUAGES } from '../../constants/languages';
import StorageService from '../../services/storage';
import ApiService from '../../services/api';
import DestinationAutocomplete from '../../components/DestinationAutocomplete';

const TripInputScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [budget, setBudget] = useState('');
  const [persons, setPersons] = useState('');
  const [objective, setObjective] = useState('');
  
  // User preferences (loaded from storage)
  const [foodType, setFoodType] = useState('');
  const [languageRanking, setLanguageRanking] = useState([]);
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const preferences = await StorageService.getPreferences();
      if (preferences) {
        setFoodType(preferences.foodType || 'veg');
        setLanguageRanking(preferences.languageRanking || ['en', 'hi']);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!destination.trim()) {
      newErrors.destination = 'Destination is required';
    } else if (destination.trim().length < 2) {
      newErrors.destination = 'Destination must be at least 2 characters';
    }

    if (!duration.trim()) {
      newErrors.duration = 'Duration is required';
    } else if (isNaN(duration) || parseInt(duration) < 1 || parseInt(duration) > 30) {
      newErrors.duration = 'Duration must be between 1 and 30 days';
    }

    if (!budget.trim()) {
      newErrors.budget = 'Budget is required';
    } else if (isNaN(budget) || parseInt(budget) <= 0) {
      newErrors.budget = 'Budget must be a valid number';
    }

    if (!persons.trim()) {
      newErrors.persons = 'Number of persons is required';
    } else if (isNaN(persons) || parseInt(persons) < 1 || parseInt(persons) > 50) {
      newErrors.persons = 'Number of persons must be between 1 and 50';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateTrip = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before continuing');
      return;
    }

    setLoading(true);
    try {
      const tripData = {
        destination: destination.trim(),
        duration: parseInt(duration),
        budget: parseInt(budget),
        persons: parseInt(persons),
        objective: objective.trim() || 'Leisure and sightseeing',
        preferences: {
          foodType,
          languageRanking,
        },
      };

      const response = await ApiService.generateTrip(tripData);

      if (response.success) {
        // Auto-save trip to history
        try {
          const existingTrips = await StorageService.getTrips() || [];
          const trip = {
            id: Date.now(),
            destination: response.trip.destination,
            duration: response.trip.duration,
            createdAt: new Date().toISOString(),
            data: response.trip,
          };
          const updatedTrips = [trip, ...existingTrips];
          await StorageService.saveTrips(updatedTrips);
          console.log('Trip auto-saved to history');
        } catch (saveError) {
          console.error('Error auto-saving trip:', saveError);
          // Don't block navigation if save fails
        }
        
        // Navigate to result screen
        navigation.navigate('TripResult', { tripData: response.trip });
      } else {
        Alert.alert('Error', response.error || 'Failed to generate trip plan');
      }
    } catch (error) {
      console.error('Trip generation error:', error);
      Alert.alert('Error', 'Failed to generate trip plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLanguageNames = () => {
    return languageRanking
      .map(code => {
        const lang = LANGUAGES.find(l => l.code === code);
        return lang?.name;
      })
      .filter(Boolean)
      .join(', ');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan Your Trip</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Destination */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Destination *</Text>
          <DestinationAutocomplete
            value={destination}
            onChangeText={setDestination}
            placeholder="Where do you want to go?"
            error={errors.destination}
          />
        </View>

        {/* Duration */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Duration (Days) *</Text>
          <TextInput
            style={[styles.input, errors.duration && styles.inputError]}
            value={duration}
            onChangeText={setDuration}
            placeholder="Number of days"
            keyboardType="numeric"
            placeholderTextColor={COLORS.textGray}
          />
          {errors.duration && (
            <Text style={styles.errorText}>{errors.duration}</Text>
          )}
        </View>

        {/* Budget */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Budget (₹) *</Text>
          <TextInput
            style={[styles.input, errors.budget && styles.inputError]}
            value={budget}
            onChangeText={setBudget}
            placeholder="Total budget in rupees"
            keyboardType="numeric"
            placeholderTextColor={COLORS.textGray}
          />
          {errors.budget && (
            <Text style={styles.errorText}>{errors.budget}</Text>
          )}
        </View>

        {/* Number of Persons */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Number of Persons *</Text>
          <TextInput
            style={[styles.input, errors.persons && styles.inputError]}
            value={persons}
            onChangeText={setPersons}
            placeholder="How many people?"
            keyboardType="numeric"
            placeholderTextColor={COLORS.textGray}
          />
          {errors.persons && (
            <Text style={styles.errorText}>{errors.persons}</Text>
          )}
        </View>

        {/* Trip Objective */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Trip Objective (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={objective}
            onChangeText={setObjective}
            placeholder="e.g., Adventure, Relaxation, Cultural exploration..."
            placeholderTextColor={COLORS.textGray}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Preferences (Auto-filled) */}
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Your Preferences</Text>
          <Text style={styles.helperText}>
            These are auto-filled from your settings
          </Text>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Food Type:</Text>
            <View style={styles.preferenceBadge}>
              <Text style={styles.preferenceBadgeText}>
                {foodType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
              </Text>
            </View>
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Languages:</Text>
            <View style={styles.preferenceBadge}>
              <Text style={styles.preferenceBadgeText}>
                {getLanguageNames() || 'Not set'}
              </Text>
            </View>
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={handleGenerateTrip}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.generateButtonText}>Generate Trip Plan ✈️</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
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
  textArea: {
    height: 90,
    paddingTop: 12,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
  },
  preferencesSection: {
    backgroundColor: COLORS.backgroundLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  preferenceLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginRight: 8,
    fontWeight: '500',
  },
  preferenceBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  preferenceBadgeText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TripInputScreen;
