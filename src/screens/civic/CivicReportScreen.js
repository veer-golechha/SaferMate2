import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { COLORS } from '../../constants/colors';
import StorageService from '../../services/storage';
import ApiService from '../../services/api';

const CivicReportScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

    if (cameraStatus !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access to capture civic issues'
      );
    }

    if (locationStatus !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'Please allow location access to tag issue location'
      );
    }
  };

  const captureImage = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        // Auto-capture location when image is taken
        captureLocation();
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        // Prompt to capture location
        captureLocation();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const captureLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Denied',
          'Location will not be attached to this report'
        );
        setLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Could not get current location. Report will be submitted without location.'
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const validateForm = () => {
    if (!imageUri) {
      Alert.alert('Image Required', 'Please capture or select an image of the issue');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Description Required', 'Please provide a description of the issue');
      return false;
    }

    if (description.trim().length < 10) {
      Alert.alert('Description Too Short', 'Please provide at least 10 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const reportData = {
        imageUri,
        description: description.trim(),
        location: location || null,
        timestamp: new Date().toISOString(),
      };

      // Save to local storage
      await StorageService.saveReport(reportData);

      // Submit to backend (mocked)
      const response = await ApiService.submitCivicReport(reportData);

      if (response.success) {
        Alert.alert(
          'Report Submitted',
          'Your civic issue has been reported successfully. You can track its status in the Track tab.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
        <Text style={styles.headerTitle}>Report Issue</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Capture Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📷 Capture Issue</Text>
          <Text style={styles.sectionSubtitle}>
            Take a photo or select from gallery
          </Text>

          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImageUri(null)}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderIcon}>📸</Text>
              <Text style={styles.placeholderText}>No image captured</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.captureButton}
            onPress={captureImage}
          >
            <Text style={styles.captureButtonText}>📷 Capture Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>
          {loadingLocation ? (
            <View style={styles.locationBox}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.locationText}>Getting location...</Text>
            </View>
          ) : location ? (
            <View style={styles.locationBox}>
              <Text style={styles.locationIcon}>✓</Text>
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>Location captured</Text>
                <Text style={styles.locationCoords}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.locationBox}>
              <Text style={styles.locationIcon}>⚠️</Text>
              <Text style={styles.locationText}>No location</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={captureLocation}
            disabled={loadingLocation}
          >
            <Text style={styles.linkButtonText}>
              {location ? 'Update Location' : 'Capture Location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Description *</Text>
          <Text style={styles.sectionSubtitle}>
            Describe the issue in detail
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="E.g., Large pothole on main road causing traffic issues..."
            placeholderTextColor={COLORS.textGray}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>
            {description.length}/500 characters
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textGray,
    marginBottom: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  captureButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  captureButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  locationCoords: {
    fontSize: 11,
    color: COLORS.textGray,
    marginTop: 2,
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textGray,
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textGray,
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CivicReportScreen;
