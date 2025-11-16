import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import ApiService from '../../services/api';

const ExploreInputScreen = ({ navigation }) => {
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExplore = async () => {
    if (!destination.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.getLocationInfo(destination);
      
      if (response.success) {
        navigation.navigate('ExploreResult', {
          destination: response.destination,
          data: response.data,
        });
      }
    } catch (error) {
      console.error('Explore error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.title}>Discover New Places</Text>
        <Text style={styles.subtitle}>
          Get fun facts, weather updates, and local insights about any destination
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter destination (e.g., Mumbai, Delhi, Goa)"
            value={destination}
            onChangeText={setDestination}
            placeholderTextColor={COLORS.textGray}
            autoCapitalize="words"
          />
        </View>

        <TouchableOpacity
          style={[styles.exploreButton, loading && styles.exploreButtonDisabled]}
          onPress={handleExplore}
          disabled={loading || !destination.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.exploreButtonText}>Explore</Text>
          )}
        </TouchableOpacity>

        <View style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>Popular Destinations</Text>
          <View style={styles.suggestionChips}>
            {['Mumbai', 'Delhi', 'Goa', 'Jaipur', 'Kerala', 'Manali'].map((place) => (
              <TouchableOpacity
                key={place}
                style={styles.chip}
                onPress={() => setDestination(place)}
              >
                <Text style={styles.chipText}>{place}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
  },
  backButton: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 56,
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  exploreButtonDisabled: {
    opacity: 0.6,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  suggestions: {
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGray,
    marginBottom: 12,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.backgroundGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.text,
  },
});

export default ExploreInputScreen;
