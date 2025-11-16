import { Platform } from 'react-native';

// API Configuration
// For physical device, manually set your computer's IP
// You can find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
// Look for "IPv4 Address" under your WiFi adapter
const COMPUTER_IP = '192.168.29.76'; // CHANGE THIS TO YOUR COMPUTER'S IP

const getApiUrl = () => {
  if (__DEV__) {
    // If using physical device with Expo Go
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      return `http://${COMPUTER_IP}:3000`;
    }
  }
  
  // Fallback for emulator/web
  return Platform.OS === 'android' 
    ? 'http://192.168.29.76:3000'  // Android emulator
    : 'http://192.168.29.76:3000'; // iOS simulator/web
};

export const API_BASE_URL = getApiUrl();
console.log('API_BASE_URL:', API_BASE_URL); // Debug log

// App Configuration
export const APP_NAME = 'SafarMate';
export const APP_VERSION = '1.0.0';

// Onboarding
export const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: 'Explore New Places',
    description: 'Discover amazing locations with fun facts, weather updates, and AQI information',
    icon: '🗺️',
  },
  {
    id: 2,
    title: 'Plan Your Perfect Trip',
    description: 'Get AI-powered itineraries customized to your preferences and budget',
    icon: '✈️',
  },
  {
    id: 3,
    title: 'Report Civic Issues',
    description: 'Help improve your community by reporting infrastructure problems',
    icon: '📸',
  },
  {
    id: 4,
    title: 'Emergency SOS & Safety',
    description: 'Quick access to emergency features, offline maps, and survival guides',
    icon: '🚨',
  },
];

// Emergency
export const SURVIVAL_GUIDE_CONTENT = `
# Emergency Survival Guide

## In Case of Emergency

### 1. Stay Calm
- Take deep breaths
- Assess the situation
- Check for immediate dangers

### 2. Emergency Numbers (India)
- Police: 100
- Fire: 101
- Ambulance: 102
- Women Helpline: 1091
- Child Helpline: 1098
- Disaster Management: 108

### 3. Basic First Aid
- For bleeding: Apply pressure with clean cloth
- For burns: Cool with running water for 10 minutes
- For fractures: Immobilize the area, don't move
- CPR: 30 chest compressions, 2 rescue breaths

### 4. Natural Disasters
**Earthquake:**
- Drop, Cover, Hold On
- Stay away from windows
- If outside, move to open area

**Flood:**
- Move to higher ground immediately
- Avoid walking/driving through water
- Turn off utilities if time permits

### 5. Getting Lost
- Stay in one place if possible
- Use phone GPS if available
- Signal for help (whistle, mirror, fire)
- Stay warm and hydrated

### 6. Medical Emergency
- Call 102 for ambulance
- Note location landmarks
- Keep patient calm and comfortable
- Don't give food/water if unconscious

### 7. Safety Tips
- Always share your location with trusted contacts
- Keep phone charged
- Carry basic first aid kit
- Know your blood type
- Have emergency contacts saved

## Important: This guide is for reference only. Always call emergency services in critical situations.
`;

// Time of day greetings
export const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
};

// Validation patterns
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  PASSWORD_MIN_LENGTH: 6,
};

// Quick actions on home screen
export const QUICK_ACTIONS = [
  {
    id: 'explore',
    title: 'Explore New Location',
    icon: '🗺️',
    color: '#4A90E2',
    route: 'ExploreInput',
  },
  {
    id: 'trip',
    title: 'Plan Trip',
    icon: '✈️',
    color: '#06A77D',
    route: 'TripPlanner',
  },
  {
    id: 'civic',
    title: 'Civic Dashboard',
    icon: '📸',
    color: '#F77F00',
    route: 'CivicDashboard',
  },
  {
    id: 'translate',
    title: 'Translate',
    icon: '🗣️',
    color: '#9B59B6',
    route: 'Translate',
  },
];
