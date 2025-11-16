import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const EmergencyScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🚨</Text>
        <Text style={styles.title}>EMERGENCY TAB</Text>
      </View>
      <Text style={styles.text}>Emergency features coming soon</Text>
      <Text style={styles.subtext}>(SOS + Offline Map + Survival Guide)</Text>
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
    color: COLORS.danger,
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

export default EmergencyScreen;
