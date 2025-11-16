import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from './src/constants/colors';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SafarMate</Text>
      <Text style={styles.subtitle}>Travel & Safety Companion</Text>
      <Text style={styles.message}>🚀 Project initialization complete!</Text>
      <Text style={styles.info}>Ready to build components</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textLight,
    marginBottom: 30,
  },
  message: {
    fontSize: 16,
    color: Colors.success,
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: Colors.textGray,
  },
});
