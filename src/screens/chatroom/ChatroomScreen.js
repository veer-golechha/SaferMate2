import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';

const CHATROOM_URL = 'http://54.90.108.66/';

const ChatroomScreen = ({ navigation }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Open the chatroom URL in the browser when the tab is accessed
      const openChatroom = async () => {
        try {
          const supported = await Linking.canOpenURL(CHATROOM_URL);
          if (supported) {
            await Linking.openURL(CHATROOM_URL);
            
            // Return to home tab after 5 seconds
            setTimeout(() => {
              navigation.navigate('Home');
            }, 5000);
          }
        } catch (error) {
          console.error('Error opening chatroom URL:', error);
        }
      };

      openChatroom();
    }, [navigation])
  );

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatroomScreen;
