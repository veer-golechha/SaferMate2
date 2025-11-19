import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import StorageService from '../../services/storage';

const TripResultScreen = ({ navigation, route }) => {
  const { tripData } = route.params;
  const [expandedDays, setExpandedDays] = useState({});
  const [downloading, setDownloading] = useState(false);

  const toggleDay = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleDownloadMap = async () => {
    setDownloading(true);
    
    // Mock download process
    setTimeout(() => {
      setDownloading(false);
      Alert.alert(
        'Success',
        `Offline map for ${tripData.destination} has been downloaded!`,
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const handleSaveTrip = async () => {
    // Trip is already auto-saved, just navigate to history
    Alert.alert(
      'Trip Saved!',
      'This trip is already saved in your history',
      [
        {
          text: 'View History',
          onPress: () => navigation.navigate('MainApp', { screen: 'Trips' })
        },
        {
          text: 'OK',
          style: 'cancel'
        }
      ]
    );
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
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{tripData.destination}</Text>
          <Text style={styles.headerSubtitle}>
            {tripData.duration} {tripData.duration === 1 ? 'Day' : 'Days'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Day-by-Day Itinerary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Day-by-Day Itinerary</Text>
          
          {tripData.itinerary.map((day) => (
            <View key={day.day} style={styles.dayCard}>
              <TouchableOpacity
                style={styles.dayHeader}
                onPress={() => toggleDay(day.day)}
              >
                <View style={styles.dayHeaderLeft}>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>Day {day.day}</Text>
                  </View>
                  <Text style={styles.dayTitle}>{day.title}</Text>
                </View>
                <Text style={styles.expandIcon}>
                  {expandedDays[day.day] ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>

              {expandedDays[day.day] && (
                <View style={styles.dayContent}>
                  {day.activities.map((activity, index) => (
                    <View key={index} style={styles.activityItem}>
                      <View style={styles.activityTimeContainer}>
                        <Text style={styles.activityTime}>{activity.time}</Text>
                      </View>
                      <View style={styles.activityDetails}>
                        <Text style={styles.activityText}>{activity.activity}</Text>
                        {activity.location && (
                          <Text style={styles.activityLocation}>
                            📍 {activity.location}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Food Itinerary */}
        {tripData.foodItinerary && tripData.foodItinerary.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍽️ Food Recommendations</Text>
            <View style={styles.card}>
              {tripData.foodItinerary.map((food, index) => (
                <View key={index} style={styles.foodItem}>
                  <Text style={styles.foodMeal}>{food.meal}</Text>
                  <Text style={styles.foodRecommendation}>
                    {food.recommendation}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Famous Places */}
        {tripData.famousPlaces && tripData.famousPlaces.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏛️ Famous Places to Visit</Text>
            <View style={styles.card}>
              {tripData.famousPlaces.map((place, index) => (
                <View key={index} style={styles.placeItem}>
                  <Text style={styles.placeIcon}>•</Text>
                  <Text style={styles.placeText}>{place}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Do's and Don'ts */}
        {tripData.dosAndDonts && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Do's and Don'ts</Text>
            
            {/* Do's */}
            <View style={styles.card}>
              <Text style={styles.dosHeader}>✅ Do's</Text>
              {tripData.dosAndDonts.dos.map((item, index) => (
                <View key={index} style={styles.dosItem}>
                  <Text style={styles.dosText}>• {item}</Text>
                </View>
              ))}
            </View>

            {/* Don'ts */}
            <View style={[styles.card, styles.cardMarginTop]}>
              <Text style={styles.dontsHeader}>❌ Don'ts</Text>
              {tripData.dosAndDonts.donts.map((item, index) => (
                <View key={index} style={styles.dontItem}>
                  <Text style={styles.dontText}>• {item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton, downloading && styles.buttonDisabled]}
            onPress={handleDownloadMap}
            disabled={downloading}
          >
            <Text style={styles.actionButtonText}>
              {downloading ? '⏳ Downloading...' : '📥 Download Offline Map'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveTrip}
          >
            <Text style={styles.actionButtonText}>
              💾 View in Trip History
            </Text>
          </TouchableOpacity>
        </View>
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
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.backgroundLight,
  },
  dayHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  dayBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  expandIcon: {
    fontSize: 14,
    color: COLORS.textGray,
    marginLeft: 8,
  },
  dayContent: {
    padding: 16,
    paddingTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityTimeContainer: {
    minWidth: 80,
    marginRight: 12,
  },
  activityTime: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  activityDetails: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 2,
  },
  activityLocation: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardMarginTop: {
    marginTop: 12,
  },
  foodItem: {
    marginBottom: 12,
  },
  foodMeal: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  foodRecommendation: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  placeIcon: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 8,
    marginTop: 2,
  },
  placeText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  dosHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 12,
  },
  dosItem: {
    marginBottom: 6,
  },
  dosText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  dontsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.danger,
    marginBottom: 12,
  },
  dontItem: {
    marginBottom: 6,
  },
  dontText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  actionButtonsContainer: {
    marginTop: 8,
  },
  actionButton: {
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  downloadButton: {
    backgroundColor: COLORS.secondary,
  },
  saveButton: {
    backgroundColor: COLORS.success,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TripResultScreen;
