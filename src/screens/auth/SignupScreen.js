import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../../constants/colors';
import { VALIDATION } from '../../constants/config';
import { GENDERS, COUNTRIES } from '../../constants/languages';
import ApiService from '../../services/api';
import StorageService from '../../services/storage';

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'male',
    age: '',
    country: 'India',
  });
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: '', phone: '' },
  ]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const updateEmergencyContact = (index, field, value) => {
    const updated = [...emergencyContacts];
    updated[index][field] = value;
    setEmergencyContacts(updated);
    // Clear error
    if (errors[`contact${index}`]) {
      setErrors({ ...errors, [`contact${index}`]: null });
    }
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: '', phone: '' }]);
  };

  const removeEmergencyContact = (index) => {
    if (emergencyContacts.length > 1) {
      const updated = emergencyContacts.filter((_, i) => i !== index);
      setEmergencyContacts(updated);
    } else {
      Alert.alert('Error', 'At least one emergency contact is required');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!VALIDATION.EMAIL.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      newErrors.password = `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`;
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
      newErrors.age = 'Invalid age';
    }

    // Validate emergency contacts
    emergencyContacts.forEach((contact, index) => {
      if (!contact.name.trim() || !contact.phone.trim()) {
        newErrors[`contact${index}`] = 'Contact name and phone are required';
      } else if (!VALIDATION.PHONE.test(contact.phone)) {
        newErrors[`contact${index}`] = 'Invalid phone number (10 digits)';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await ApiService.signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        gender: formData.gender,
        age: parseInt(formData.age),
        country: formData.country,
        emergencyContacts: emergencyContacts,
        preferences: {
          foodType: 'veg',
          languages: ['English', 'Hindi'],
        },
      });

      if (response.success) {
        // Save token and user data
        await StorageService.saveAuthToken(response.token);
        await StorageService.saveUserData(response.user);

        // Navigate to onboarding for new users
        navigation.replace('Onboarding');
      } else {
        setErrors({ general: response.error || 'Signup failed' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({
        general: error.error || 'Network error. Please check your connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/safermate-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join SafarMate today</Text>

        {/* Error Message */}
        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name *</Text>
          <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              editable={!loading}
            />
          </View>
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email *</Text>
          <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password *</Text>
          <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {/* Gender Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.gender}
              onValueChange={(value) => updateFormData('gender', value)}
              enabled={!loading}
              style={styles.picker}
            >
              {GENDERS.map((gender) => (
                <Picker.Item
                  key={gender.value}
                  label={gender.label}
                  value={gender.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Age Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Age *</Text>
          <View style={[styles.inputWrapper, errors.age && styles.inputError]}>
            <Text style={styles.inputIcon}>🎂</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your age"
              value={formData.age}
              onChangeText={(value) => updateFormData('age', value)}
              keyboardType="numeric"
              editable={!loading}
            />
          </View>
          {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
        </View>

        {/* Country Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Country *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.country}
              onValueChange={(value) => updateFormData('country', value)}
              enabled={!loading}
              style={styles.picker}
            >
              {COUNTRIES.map((country) => (
                <Picker.Item key={country} label={country} value={country} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Emergency Contacts *</Text>
          <Text style={styles.sectionSubtitle}>At least one contact required</Text>

          {emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <Text style={styles.contactLabel}>Contact {index + 1}</Text>
                {emergencyContacts.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeEmergencyContact(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contact name"
                  value={contact.name}
                  onChangeText={(value) =>
                    updateEmergencyContact(index, 'name', value)
                  }
                  editable={!loading}
                />
              </View>

              <View style={[styles.inputWrapper, styles.inputMarginTop]}>
                <Text style={styles.inputIcon}>📱</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Phone number (10 digits)"
                  value={contact.phone}
                  onChangeText={(value) =>
                    updateEmergencyContact(index, 'phone', value)
                  }
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!loading}
                />
              </View>

              {errors[`contact${index}`] && (
                <Text style={styles.errorText}>{errors[`contact${index}`]}</Text>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.addContactButton}
            onPress={addEmergencyContact}
            disabled={loading}
          >
            <Text style={styles.addContactText}>+ Add Another Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Signup Button */}
        <TouchableOpacity
          style={[styles.signupButton, loading && styles.signupButtonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signupButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  inputMarginTop: {
    marginTop: 8,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: 8,
  },
  eyeIconText: {
    fontSize: 20,
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
  sectionContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 12,
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
    fontSize: 14,
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
  signupButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default SignupScreen;
