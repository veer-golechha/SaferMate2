import React, { useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { StorageService } from '../services/storage';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2500));
        const token = await StorageService.getAuthToken();
        
        if (token) {
          navigation.replace('MainApp');
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        navigation.replace('Login');
      }
    };

    checkAuthAndNavigate();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/safermate-icon.png')}
        style={styles.logo}
      />
      <ActivityIndicator 
        size="large" 
        color="#FFFFFF" 
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a3a52',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  loader: {
    marginTop: 50,
  },
});

export default SplashScreen;
