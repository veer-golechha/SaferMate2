import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { AQI_CATEGORIES } from '../../constants/languages';

const ExploreResultScreen = ({ route, navigation }) => {
  const { destination, data } = route.params;

  const getAQIColor = (aqi) => {
    const category = AQI_CATEGORIES.find(
      (cat) => aqi >= cat.min && aqi <= cat.max
    );
    return category?.color || COLORS.textGray;
  };

  const getAQILabel = (aqi) => {
    const category = AQI_CATEGORIES.find(
      (cat) => aqi >= cat.min && aqi <= cat.max
    );
    return category?.label || 'Unknown';
  };

  const getCivicColor = (metric) => {
    if (metric >= 4) return COLORS.success;
    if (metric >= 3) return COLORS.warning;
    return COLORS.danger;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{destination}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Weather Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>☀️</Text>
            <Text style={styles.cardTitle}>Weather</Text>
          </View>
          <View style={styles.weatherContent}>
            <Text style={styles.temperature}>{data.weather.temperature}°C</Text>
            <Text style={styles.weatherCondition}>{data.weather.condition}</Text>
          </View>
        </View>

        {/* AQI Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🌫️</Text>
            <Text style={styles.cardTitle}>Air Quality Index</Text>
          </View>
          <View style={styles.aqiContent}>
            <Text style={[styles.aqiValue, { color: getAQIColor(data.aqi) }]}>
              {data.aqi}
            </Text>
            <View style={[styles.aqiBadge, { backgroundColor: getAQIColor(data.aqi) }]}>
              <Text style={styles.aqiLabel}>{getAQILabel(data.aqi)}</Text>
            </View>
          </View>
        </View>

        {/* Civic Metric Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🏛️</Text>
            <Text style={styles.cardTitle}>Civic Infrastructure</Text>
          </View>
          <View style={styles.civicContent}>
            <Text style={[styles.civicValue, { color: getCivicColor(data.civicMetric) }]}>
              {data.civicMetric.toFixed(1)}/5.0
            </Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text key={star} style={styles.star}>
                  {star <= Math.round(data.civicMetric) ? '⭐' : '☆'}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Fun Facts */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>✨</Text>
            <Text style={styles.cardTitle}>Fun Facts</Text>
          </View>
          <View style={styles.listContent}>
            {data.funFacts.map((fact, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{fact}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Famous Foods */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🍽️</Text>
            <Text style={styles.cardTitle}>Famous Foods</Text>
          </View>
          <View style={styles.listContent}>
            {data.famousFoods.map((food, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{food}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Famous Places */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📍</Text>
            <Text style={styles.cardTitle}>Places to Visit</Text>
          </View>
          <View style={styles.listContent}>
            {data.famousPlaces.map((place, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{place}</Text>
              </View>
            ))}
          </View>
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
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  weatherContent: {
    alignItems: 'center',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  weatherCondition: {
    fontSize: 18,
    color: COLORS.textGray,
    marginTop: 8,
  },
  aqiContent: {
    alignItems: 'center',
  },
  aqiValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  aqiBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  aqiLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  civicContent: {
    alignItems: 'center',
  },
  civicValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  star: {
    fontSize: 24,
    marginHorizontal: 2,
  },
  listContent: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
});

export default ExploreResultScreen;
