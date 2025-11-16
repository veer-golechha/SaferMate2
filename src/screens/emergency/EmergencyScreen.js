import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as SMS from 'expo-sms';
import * as Location from 'expo-location';
import { COLORS } from '../../constants/colors';
import { SURVIVAL_GUIDE_CONTENT } from '../../constants/config';
import StorageService from '../../services/storage';

const EmergencyScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showSurvivalGuide, setShowSurvivalGuide] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadProfileImage();
    }, [])
  );

  const loadProfileImage = async () => {
    try {
      const userData = await StorageService.getUserData();
      if (userData?.profileImage) {
        setProfileImage(userData.profileImage);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('Settings');
  };

  const handleSOS = async () => {
    Alert.alert(
      '🚨 Emergency SOS',
      'This will send your location to your emergency contacts. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send SOS',
          onPress: sendSOSMessage,
          style: 'destructive',
        },
      ]
    );
  };

  const sendSOSMessage = async () => {
    setLoading(true);
    try {
      // Check SMS availability
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'SMS is not available on this device');
        setLoading(false);
        return;
      }

      // Get user data for emergency contacts
      const userData = await StorageService.getUserData();
      if (!userData || !userData.emergencyContacts || userData.emergencyContacts.length === 0) {
        Alert.alert('Error', 'No emergency contacts found. Please add contacts in Settings.');
        setLoading(false);
        return;
      }

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Send SOS without location
        const phoneNumbers = userData.emergencyContacts.map(c => c.phone);
        const message = `SOS! I need help. I couldn't share my location due to permissions. Please call me immediately!`;
        
        await SMS.sendSMSAsync(phoneNumbers, message);
        Alert.alert('SOS Sent', 'Emergency message sent to your contacts (without location)');
        setLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

      // Prepare SMS
      const phoneNumbers = userData.emergencyContacts.map(c => c.phone);
      const message = `SOS! I need help. My location is: ${googleMapsLink}`;

      // Open SMS composer
      await SMS.sendSMSAsync(phoneNumbers, message);

      // Log SOS event locally
      const sosEvent = {
        timestamp: new Date().toISOString(),
        location: { latitude, longitude },
        contacts: userData.emergencyContacts,
      };
      console.log('SOS Event:', sosEvent);

      Alert.alert('SOS Sent', 'Emergency message sent to your contacts');
    } catch (error) {
      console.error('SOS Error:', error);
      Alert.alert('Error', 'Failed to send SOS message');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineMap = () => {
    Alert.alert(
      'Offline Map',
      'Download offline maps for your destination to access them without internet.',
      [
        {
          text: 'OK',
          onPress: () => Alert.alert('Coming Soon', 'Offline map download feature will be available soon'),
        },
      ]
    );
  };

  const handleSurvivalGuide = () => {
    setShowSurvivalGuide(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Emergency</Text>
          <Text style={styles.headerSubtitle}>Quick access to safety features</Text>
        </View>
        
        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleProfilePress}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <Text style={styles.profileIcon}>👤</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* SOS Button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity
            style={[styles.sosButton, loading && styles.sosButtonDisabled]}
            onPress={handleSOS}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.sosIcon}>🚨</Text>
                <Text style={styles.sosText}>SOS</Text>
                <Text style={styles.sosSubtext}>Emergency Alert</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.sosDescription}>
            Press to send your location to emergency contacts
          </Text>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity style={styles.linkCard} onPress={handleOfflineMap}>
            <View style={styles.linkIconContainer}>
              <Text style={styles.linkIcon}>🗺️</Text>
            </View>
            <Text style={styles.linkTitle}>Offline Map</Text>
            <Text style={styles.linkDescription}>
              Download maps for offline access
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkCard} onPress={handleSurvivalGuide}>
            <View style={styles.linkIconContainer}>
              <Text style={styles.linkIcon}>📖</Text>
            </View>
            <Text style={styles.linkTitle}>Survival Guide</Text>
            <Text style={styles.linkDescription}>
              Emergency tips and instructions
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Survival Guide Modal */}
      <Modal
        visible={showSurvivalGuide}
        animationType="slide"
        onRequestClose={() => setShowSurvivalGuide(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📖 Survival Guide</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSurvivalGuide(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.guideText}>{SURVIVAL_GUIDE_CONTENT}</Text>
          </ScrollView>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.danger,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileIcon: {
    fontSize: 28,
  },
  content: {
    padding: 20,
  },
  sosContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  sosButtonDisabled: {
    opacity: 0.6,
  },
  sosIcon: {
    fontSize: 60,
    marginBottom: 8,
  },
  sosText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sosSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  sosDescription: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkCard: {
    width: '48%',
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  linkIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkIcon: {
    fontSize: 32,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  linkDescription: {
    fontSize: 12,
    color: COLORS.textGray,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  guideText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 24,
  },
});

export default EmergencyScreen;
