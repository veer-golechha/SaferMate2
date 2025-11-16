import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: '@safarmate_auth_token',
  USER_DATA: '@safarmate_user_data',
  USER_PREFERENCES: '@safarmate_preferences',
  TRIPS: '@safarmate_trips',
  REPORTS: '@safarmate_reports',
};

export const StorageService = {
  // Auth Token
  async saveAuthToken(token) {
    try {
      await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
      return true;
    } catch (error) {
      console.error('Error saving auth token:', error);
      return false;
    }
  },

  async getAuthToken() {
    try {
      return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
      return true;
    } catch (error) {
      console.error('Error removing auth token:', error);
      return false;
    }
  },

  // User Data
  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  },

  async getUserData() {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  async updateUserData(updates) {
    try {
      const currentData = await this.getUserData();
      const updatedData = { ...currentData, ...updates };
      await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(updatedData));
      return updatedData;
    } catch (error) {
      console.error('Error updating user data:', error);
      return null;
    }
  },

  // User Preferences
  async savePreferences(preferences) {
    try {
      await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  },

  async getPreferences() {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : { foodType: 'veg', languages: ['English', 'Hindi'] };
    } catch (error) {
      console.error('Error getting preferences:', error);
      return { foodType: 'veg', languages: ['English', 'Hindi'] };
    }
  },

  // Trips
  async saveTrip(trip) {
    try {
      const trips = await this.getTrips();
      trips.push({ ...trip, id: Date.now(), savedAt: new Date().toISOString() });
      await AsyncStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));
      return true;
    } catch (error) {
      console.error('Error saving trip:', error);
      return false;
    }
  },

  async getTrips() {
    try {
      const data = await AsyncStorage.getItem(KEYS.TRIPS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting trips:', error);
      return [];
    }
  },

  // Reports
  async saveReport(report) {
    try {
      const reports = await this.getReports();
      reports.push({ ...report, localId: Date.now() });
      await AsyncStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
      return true;
    } catch (error) {
      console.error('Error saving report:', error);
      return false;
    }
  },

  async getReports() {
    try {
      const data = await AsyncStorage.getItem(KEYS.REPORTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting reports:', error);
      return [];
    }
  },

  // Clear all data (logout)
  async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        KEYS.AUTH_TOKEN,
        KEYS.USER_DATA,
        KEYS.USER_PREFERENCES,
        KEYS.TRIPS,
        KEYS.REPORTS,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },
};
