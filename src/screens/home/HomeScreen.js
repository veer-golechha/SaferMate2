import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../../constants/colors';
import StorageService from '../../services/storage';

const HomeScreen = ({ navigation }) => {
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            await StorageService.clearAll();
            navigation.replace('Splash');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🏠</Text>
        <Text style={styles.title}>HOME SCREEN</Text>
      </View>
      <Text style={styles.text}>This is the Home Screen</Text>
      <Text style={styles.subtext}>Main App (Placeholder)</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>User is logged in</Text>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout & Clear Token</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.success,
    letterSpacing: 2,
  },
  text: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 10,
  },
  subtext: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: 10,
  },
  badge: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.success,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
