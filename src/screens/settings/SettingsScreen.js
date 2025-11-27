import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/colors';
import { GENDERS, COUNTRIES, FOOD_TYPES, LANGUAGES } from '../../constants/languages';
import { VALIDATION } from '../../constants/config';
import StorageService from '../../services/storage';
import ApiService from '../../services/api';

const SettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // User ID
  const [userId, setUserId] = useState(null);
  
  // Profile fields
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('India');
  const [profileImage, setProfileImage] = useState(null);
  
  // Emergency contacts
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: '', phone: '' }
  ]);
  
  // Preferences
  const [foodType, setFoodType] = useState('veg');
  const [languageRanking, setLanguageRanking] = useState(['en', 'hi']);
  
  const [errors, setErrors] = useState({});

  // Language selection helper
  const toggleLanguage = (languageCode) => {
    if (languageRanking.includes(languageCode)) {
      // Deselect: remove from array
      setLanguageRanking(languageRanking.filter(code => code !== languageCode));
    } else {
      // Select: add to end of array (maintains selection order)
      setLanguageRanking([...languageRanking, languageCode]);
    }
  };

  const getLanguagePosition = (languageCode) => {
    const index = languageRanking.indexOf(languageCode);
    return index !== -1 ? index + 1 : null;
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await StorageService.getUserData();
      const preferences = await StorageService.getPreferences();
      
      if (userData) {
        setUserId(userData.id);
        setName(userData.name || '');
        setGender(userData.gender || 'male');
        setAge(userData.age?.toString() || '');
        setCountry(userData.country || 'India');
        setProfileImage(userData.profileImage || null);
        
        // Ensure emergency contacts have id field
        const contacts = userData.emergencyContacts || [{ name: '', phone: '' }];
        const contactsWithIds = contacts.map((contact, index) => ({
          id: contact.id || index + 1,
          name: contact.name || '',
          phone: contact.phone || ''
        }));
        setEmergencyContacts(contactsWithIds);
      }
      
      if (preferences) {
        setFoodType(preferences.foodType || 'veg');
        setLanguageRanking(preferences.languageRanking || ['en', 'hi']);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        // Save to persistent storage
        const persistentPath = await StorageService.saveImagePersistently(result.assets[0].uri, 'profile');
        if (persistentPath) {
          setProfileImage(persistentPath);
        } else {
          Alert.alert('Error', 'Failed to save image');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        // Save to persistent storage
        const persistentPath = await StorageService.saveImagePersistently(result.assets[0].uri, 'profile');
        if (persistentPath) {
          setProfileImage(persistentPath);
        } else {
          Alert.alert('Error', 'Failed to save image');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleProfileImagePress = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const addEmergencyContact = () => {
    const newId = Math.max(...emergencyContacts.map(c => c.id), 0) + 1;
    setEmergencyContacts([...emergencyContacts, { id: newId, name: '', phone: '' }]);
  };

  const removeEmergencyContact = (id) => {
    if (emergencyContacts.length <= 1) {
      Alert.alert('Error', 'You must have at least one emergency contact');
      return;
    }
    setEmergencyContacts(emergencyContacts.filter(c => c.id !== id));
  };

  const updateEmergencyContact = (id, field, value) => {
    setEmergencyContacts(
      emergencyContacts.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!age || isNaN(age) || parseInt(age) < 1 || parseInt(age) > 120) {
      newErrors.age = 'Valid age is required';
    }

    // Validate emergency contacts
    emergencyContacts.forEach((contact, index) => {
      if (!contact.name.trim()) {
        newErrors[`contact_${contact.id}_name`] = 'Name is required';
      }
      if (!contact.phone.trim()) {
        newErrors[`contact_${contact.id}_phone`] = 'Phone is required';
      } else if (!VALIDATION.PHONE.test(contact.phone)) {
        newErrors[`contact_${contact.id}_phone`] = 'Invalid phone format';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fix the errors before saving');
      return;
    }

    setSaving(true);
    try {
      const userData = {
        userId: userId,
        name,
        gender,
        age: parseInt(age),
        country,
        profileImage,
        emergencyContacts,
        preferences: {
          foodType,
          languageRanking,
        }
      };

      console.log('Saving user data with profileImage:', profileImage);

      // Update via API
      const response = await ApiService.updateProfile(userData);
      
      if (response.success) {
        console.log('API response user:', response.user);
        // Save updated data locally
        await StorageService.saveUserData(response.user);
        await StorageService.savePreferences(response.user.preferences);
        Alert.alert('Success', 'Settings saved successfully');
      } else {
        Alert.alert('Error', response.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
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
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Picture</Text>
        <TouchableOpacity style={styles.profileImageContainer} onPress={handleProfileImagePress}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>👤</Text>
            </View>
          )}
          <Text style={styles.changePhotoText}>Tap to change</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={gender}
              onValueChange={setGender}
              style={styles.picker}
            >
              {GENDERS.map((g) => (
                <Picker.Item key={g.value} label={g.label} value={g.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={[styles.input, errors.age && styles.inputError]}
            value={age}
            onChangeText={setAge}
            placeholder="Enter your age"
            keyboardType="numeric"
          />
          {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Country</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={country}
              onValueChange={setCountry}
              style={styles.picker}
            >
              {COUNTRIES.map((c) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <Text style={styles.sectionSubtitle}>At least 1 contact required</Text>

        {emergencyContacts.map((contact, index) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Text style={styles.contactLabel}>Contact {index + 1}</Text>
              {emergencyContacts.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeEmergencyContact(contact.id)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              style={[
                styles.input,
                errors[`contact_${contact.id}_name`] && styles.inputError
              ]}
              value={contact.name}
              onChangeText={(value) => updateEmergencyContact(contact.id, 'name', value)}
              placeholder="Contact name"
            />
            {errors[`contact_${contact.id}_name`] && (
              <Text style={styles.errorText}>{errors[`contact_${contact.id}_name`]}</Text>
            )}

            <TextInput
              style={[
                styles.input,
                styles.inputMarginTop,
                errors[`contact_${contact.id}_phone`] && styles.inputError
              ]}
              value={contact.phone}
              onChangeText={(value) => updateEmergencyContact(contact.id, 'phone', value)}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />
            {errors[`contact_${contact.id}_phone`] && (
              <Text style={styles.errorText}>{errors[`contact_${contact.id}_phone`]}</Text>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addContactButton} onPress={addEmergencyContact}>
          <Text style={styles.addContactText}>+ Add Emergency Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Food Type</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={foodType}
              onValueChange={setFoodType}
              style={styles.picker}
            >
              {FOOD_TYPES.map((f) => (
                <Picker.Item key={f.value} label={f.label} value={f.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Preferred Languages</Text>
          <Text style={styles.helperText}>
            Tap languages to select/deselect. Order matters for translations.
          </Text>
          
          {/* Language chips */}
          <View style={styles.languageChipsContainer}>
            {LANGUAGES.map((language) => {
              const position = getLanguagePosition(language.code);
              const isSelected = position !== null;
              
              return (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageChip,
                    isSelected && styles.languageChipSelected
                  ]}
                  onPress={() => toggleLanguage(language.code)}
                >
                  <Text style={[
                    styles.languageChipText,
                    isSelected && styles.languageChipTextSelected
                  ]}>
                    {language.name} {isSelected && `(${position})`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Selected languages summary */}
          {languageRanking.length > 0 && (
            <View style={styles.selectedLanguagesContainer}>
              <Text style={styles.selectedLanguagesLabel}>Selection order:</Text>
              <Text style={styles.selectedLanguagesText}>
                {languageRanking.map((code, index) => {
                  const lang = LANGUAGES.find(l => l.code === code);
                  return lang?.name;
                }).filter(Boolean).join(' → ')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 12,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 60,
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 4,
  },
  input: {
    height: 50,
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  inputMarginTop: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
  },
  pickerWrapper: {
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  contactCard: {
    backgroundColor: COLORS.backgroundGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addContactButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addContactText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 20,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.backgroundGray,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutButtonText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  languageChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  languageChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundGray,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  languageChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  languageChipText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  languageChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedLanguagesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  selectedLanguagesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textGray,
    marginBottom: 4,
  },
  selectedLanguagesText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
});

export default SettingsScreen;
