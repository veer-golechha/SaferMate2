export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

export const GENDERS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export const FOOD_TYPES = [
  { label: 'Vegetarian', value: 'veg' },
  { label: 'Non-Vegetarian', value: 'non-veg' },
];

export const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'China',
  'Singapore',
  'UAE',
  'Other',
];

export const REPORT_STATUS = {
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In Review',
  RESOLVED: 'Resolved',
};

export const AQI_CATEGORIES = [
  { min: 0, max: 50, label: 'Good', color: '#00E400' },
  { min: 51, max: 100, label: 'Moderate', color: '#FFFF00' },
  { min: 101, max: 150, label: 'Unhealthy for Sensitive Groups', color: '#FF7E00' },
  { min: 151, max: 200, label: 'Unhealthy', color: '#FF0000' },
  { min: 201, max: 300, label: 'Very Unhealthy', color: '#8F3F97' },
  { min: 301, max: 500, label: 'Hazardous', color: '#7E0023' },
];
