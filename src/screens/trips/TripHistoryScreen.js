import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const TripHistoryScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>✈️</Text>
        <Text style={styles.title}>TRIP HISTORY</Text>
      </View>
      <Text style={styles.text}>Your saved trips will appear here</Text>
      <Text style={styles.subtext}>(Trip history coming soon)</Text>
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
    color: COLORS.secondary,
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
    textAlign: 'center',
  },
});

export default TripHistoryScreen;
