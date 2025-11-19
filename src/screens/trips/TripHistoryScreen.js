import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import StorageService from '../../services/storage';

const TripHistoryScreen = ({ navigation }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadTrips();
    }, [])
  );

  const loadTrips = async () => {
    setLoading(true);
    try {
      const savedTrips = await StorageService.getTrips();
      console.log('[TRIP-HISTORY] Raw trips loaded:', savedTrips?.length || 0);
      
      // Deduplicate trips based on destination, duration, budget, and persons
      const uniqueTrips = [];
      const tripKeys = new Set();
      
      (savedTrips || []).forEach(trip => {
        // Create a unique key for each trip
        const tripKey = `${trip.destination?.toLowerCase()}-${trip.duration}-${trip.data?.budget}-${trip.data?.persons}`;
        
        if (!tripKeys.has(tripKey)) {
          tripKeys.add(tripKey);
          uniqueTrips.push(trip);
        } else {
          console.log('[TRIP-HISTORY] Duplicate trip removed:', trip.destination);
        }
      });
      
      console.log('[TRIP-HISTORY] After deduplication:', uniqueTrips.length);
      
      // Cap to last 30 trips
      const limitedTrips = uniqueTrips.slice(0, 30);
      
      // Log first trip data for verification
      if (limitedTrips.length > 0) {
        console.log('[TRIP-HISTORY] Sample trip data:', {
          destination: limitedTrips[0].destination,
          duration: limitedTrips[0].duration,
          budget: limitedTrips[0].data?.budget,
          persons: limitedTrips[0].data?.persons,
          objective: limitedTrips[0].data?.objective,
          createdAt: limitedTrips[0].createdAt,
        });
      }
      
      setTrips(limitedTrips);
    } catch (error) {
      console.error('[TRIP-HISTORY] Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTripPress = (trip) => {
    navigation.navigate('TripResult', { tripData: trip.data });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleLongPress = (tripId, destination) => {
    Alert.alert(
      'Delete Trip',
      `Do you want to delete this trip to ${destination}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedTrips = trips.filter(t => t.id !== tripId);
              await StorageService.saveTrips(updatedTrips);
              setTrips(updatedTrips);
            } catch (error) {
              console.error('Error deleting trip:', error);
              Alert.alert('Error', 'Failed to delete trip');
            }
          },
        },
      ]
    );
  };

  const renderTripItem = ({ item }) => {
    // Log rendering data for verification
    console.log('[TRIP-HISTORY] Rendering card:', {
      id: item.id,
      destination: item.destination,
      duration: item.duration,
      budget: item.data?.budget,
      persons: item.data?.persons,
      objective: item.data?.objective,
    });
    
    return (
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => handleTripPress(item)}
        onLongPress={() => handleLongPress(item.id, item.destination)}
        activeOpacity={0.7}
      >
        {/* Header with destination and date badge */}
        <View style={styles.cardHeader}>
          <View style={styles.destinationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.destination} numberOfLines={1} ellipsizeMode="tail">
              {item.destination || 'Unknown'}
            </Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        
        {/* Trip details in grid layout */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailValue}>{item.duration || 0}</Text>
            <Text style={styles.detailLabel}>days</Text>
          </View>
          
          <View style={styles.detailCard}>
            <Text style={styles.detailIcon}>💰</Text>
            <Text style={styles.detailValue} numberOfLines={1} adjustsFontSizeToFit>
              {item.data?.budget ? `₹${item.data.budget.toLocaleString()}` : 'N/A'}
            </Text>
            <Text style={styles.detailLabel}>budget</Text>
          </View>
          
          <View style={styles.detailCard}>
            <Text style={styles.detailIcon}>👥</Text>
            <Text style={styles.detailValue}>{item.data?.persons || 1}</Text>
            <Text style={styles.detailLabel}>
              {(item.data?.persons || 1) === 1 ? 'person' : 'people'}
            </Text>
          </View>
        </View>
        
        {/* Objective tag - only show if present */}
        {item.data?.objective && (
          <View style={styles.metaInfo}>
            <View style={styles.objectiveTag}>
              <Text style={styles.tagText} numberOfLines={1} ellipsizeMode="tail">
                🎯 {item.data.objective}
              </Text>
            </View>
          </View>
        )}
        
        {/* View details indicator */}
        <View style={styles.viewDetailsContainer}>
          <Text style={styles.viewDetailsText}>View itinerary →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>✈️</Text>
      <Text style={styles.emptyTitle}>No Trips Yet</Text>
      <Text style={styles.emptyText}>
        Plan your first trip to see it here!
      </Text>
      <TouchableOpacity
        style={styles.planButton}
        onPress={() => navigation.navigate('TripInput')}
      >
        <Text style={styles.planButtonText}>Plan a Trip</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trip History</Text>
        <Text style={styles.headerSubtitle}>
          {trips.length} {trips.length === 1 ? 'trip' : 'trips'} saved
        </Text>
      </View>

      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#FAFBFC',
  },
  destinationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  destination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  dateBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
  },
  detailCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  detailIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textGray,
    fontWeight: '500',
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  objectiveTag: {
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFD699',
    maxWidth: '100%',
  },
  tagText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FAFBFC',
  },
  viewDetailsText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  planButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  planButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TripHistoryScreen;
