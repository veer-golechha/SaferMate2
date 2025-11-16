import * as Location from 'expo-location';
import * as Camera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

export const PermissionsService = {
  // Location Permission
  async requestLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'SafarMate needs location access for SOS features and location-based services.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  },

  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  },

  // Camera Permission
  async requestCameraPermission() {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'SafarMate needs camera access to capture photos for civic reports.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  },

  async takePicture() {
    try {
      const hasPermission = await this.requestCameraPermission();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('Error taking picture:', error);
      return null;
    }
  },

  // Image Picker Permission
  async requestImagePickerPermission() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Media Library Permission Required',
          'SafarMate needs access to your photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting image picker permission:', error);
      return false;
    }
  },

  async pickImage() {
    try {
      const hasPermission = await this.requestImagePickerPermission();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }
  },

  // Check if all required permissions are granted
  async checkAllPermissions() {
    const locationStatus = await Location.getForegroundPermissionsAsync();
    const cameraStatus = await Camera.getCameraPermissionsAsync();
    const mediaStatus = await ImagePicker.getMediaLibraryPermissionsAsync();

    return {
      location: locationStatus.status === 'granted',
      camera: cameraStatus.status === 'granted',
      media: mediaStatus.status === 'granted',
    };
  },
};
