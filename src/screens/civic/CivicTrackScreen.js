import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import StorageService from '../../services/storage';

const CivicTrackScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [])
  );

  const loadReports = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const savedReports = await StorageService.getReports();
      
      // Add mock status to reports (simulating backend response)
      const reportsWithStatus = savedReports.map((report, index) => {
        const statuses = ['Submitted', 'In Review', 'Resolved'];
        const randomStatus = statuses[index % statuses.length];
        
        return {
          ...report,
          status: report.status || randomStatus,
          id: report.localId,
        };
      }).reverse(); // Show newest first
      
      setReports(reportsWithStatus);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports(true);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return '#FFA500';
      case 'In Review':
        return '#2196F3';
      case 'Resolved':
        return '#4CAF50';
      default:
        return COLORS.textGray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted':
        return '📝';
      case 'In Review':
        return '🔍';
      case 'Resolved':
        return '✅';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderReportCard = ({ item }) => (
    <TouchableOpacity
      style={styles.reportCard}
      activeOpacity={0.7}
    >
      {/* Image Thumbnail */}
      <Image
        source={{ uri: item.imageUri }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* Report Details */}
      <View style={styles.reportDetails}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportDate}>{formatDate(item.timestamp)}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
          {item.description}
        </Text>

        {item.location && (
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No Reports Yet</Text>
      <Text style={styles.emptyText}>
        Your submitted civic issues will appear here
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('CivicReport')}
      >
        <Text style={styles.primaryButtonText}>Report an Issue</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Track Status</Text>
          <Text style={styles.headerSubtitle}>
            {reports.length} {reports.length === 1 ? 'report' : 'reports'}
          </Text>
        </View>
      </View>

      {/* Reports List */}
      {reports.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textGray,
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
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  thumbnail: {
    width: 100,
    height: 120,
    backgroundColor: '#F0F0F0',
  },
  reportDetails: {
    flex: 1,
    padding: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 12,
    color: COLORS.textGray,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusIcon: {
    fontSize: 10,
  },
  statusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.textGray,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CivicTrackScreen;
