const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI = null;
let model = null;

// Cache for storing location data
// Structure: { destination: { data: {...}, timestamp: Date } }
const locationCache = new Map();
const tripCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const CACHE_FILE_PATH = path.join(__dirname, '../data/location-cache.json');
const TRIP_CACHE_FILE_PATH = path.join(__dirname, '../data/trip-cache.json');

// Load cache from file
const loadCacheFromFile = () => {
  try {
    // Load location cache
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const fileData = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      const cacheData = JSON.parse(fileData);
      
      // Convert plain object back to Map
      Object.entries(cacheData).forEach(([key, value]) => {
        locationCache.set(key, value);
      });
      
      console.log(`Loaded ${locationCache.size} cached locations from file`);
    }
    
    // Load trip cache
    if (fs.existsSync(TRIP_CACHE_FILE_PATH)) {
      const fileData = fs.readFileSync(TRIP_CACHE_FILE_PATH, 'utf8');
      const cacheData = JSON.parse(fileData);
      
      // Convert plain object back to Map
      Object.entries(cacheData).forEach(([key, value]) => {
        tripCache.set(key, value);
      });
      
      console.log(`Loaded ${tripCache.size} cached trips from file`);
    }
  } catch (error) {
    console.error('Error loading cache from file:', error);
  }
};

// Save cache to file
const saveCacheToFile = () => {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Save location cache
    const cacheData = Object.fromEntries(locationCache);
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2), 'utf8');
    
    // Save trip cache
    const tripCacheData = Object.fromEntries(tripCache);
    fs.writeFileSync(TRIP_CACHE_FILE_PATH, JSON.stringify(tripCacheData, null, 2), 'utf8');
    
    console.log('Cache saved to file');
  } catch (error) {
    console.error('Error saving cache to file:', error);
  }
};

// Initialize Gemini
const initializeGemini = () => {
  // Load cached data from file
  loadCacheFromFile();
  
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('Gemini API key not configured. Using mock data.');
    return false;
  }
  
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0,
      },
    });
    console.log('Gemini initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
    return false;
  }
};

// Get location information using Gemini
const getLocationInfo = async (destination) => {
  // Normalize destination name for cache key
  const cacheKey = destination.toLowerCase().trim();
  
  // Check if we have cached data
  if (locationCache.has(cacheKey)) {
    const cached = locationCache.get(cacheKey);
    const age = Date.now() - cached.timestamp;
    
    // Return cached data if less than 1 day old
    if (age < CACHE_DURATION) {
      console.log(`Using cached data for "${destination}" (age: ${Math.round(age / 3600000)}h)`);
      return cached.data;
    } else {
      console.log(`Cache expired for "${destination}", fetching fresh data...`);
    }
  }
  
  const prompt = `Provide detailed information about ${destination} in the following JSON format. Be accurate and informative:

{
  "funFacts": [
    "5 interesting and unique facts about this place"
  ],
  "famousFoods": [
    "5 famous local dishes with brief descriptions, format: 'Dish Name - Description'"
  ],
  "famousPlaces": [
    "5 must-visit tourist attractions with brief descriptions, format: 'Place Name - Description'"
  ],
  "weather": {
    "temperature": <average temperature in Celsius>,
    "condition": "<typical weather condition>"
  },
  "aqi": <estimated air quality index 0-500>,
  "civicMetric": <infrastructure rating 0-5 as decimal>
}

Provide ONLY the JSON response, no additional text.`;

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} to fetch data for "${destination}"...`);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response and parse JSON
      let jsonText = text.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }
      
      const data = JSON.parse(jsonText);
      
      // Cache the result with current timestamp
      locationCache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      console.log(`✓ Successfully cached fresh data for "${destination}"`);
      
      // Save cache to file
      saveCacheToFile();
      
      return data;
    } catch (error) {
      lastError = error;
      
      // Check if it's a rate limit or overload error (503, 429)
      if (error.status === 503 || error.status === 429) {
        console.log(`⚠ Server overloaded (attempt ${attempt}/${maxRetries}). Retrying in ${attempt * 2}s...`);
        
        // Wait before retrying (exponential backoff: 2s, 4s, 6s)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
      }
      
      // For other errors or final attempt, break the loop
      console.error('Gemini API error:', error.message || error);
      break;
    }
  }
  
  // All retries failed, check for fallback cache
  if (locationCache.has(cacheKey)) {
    const cached = locationCache.get(cacheKey);
    const ageHours = Math.round((Date.now() - cached.timestamp) / 3600000);
    console.log(`⚠ Using expired cache data for "${destination}" (${ageHours}h old) as fallback`);
    return cached.data;
  }
  
  // No cache available, throw the error
  throw lastError;
};

// Generate trip itinerary using Gemini
const generateTrip = async (tripData) => {
  const { destination, duration, budget, persons, objective, preferences } = tripData;
  
  // Create cache key based on trip parameters (normalize for consistency)
  const cacheKey = JSON.stringify({
    destination: destination.toLowerCase().trim(),
    duration,
    budget: Math.floor(budget / 5000) * 5000, // Round to nearest 5000 for cache efficiency
    persons,
    objective: (objective || 'leisure').toLowerCase().trim(),
    foodType: preferences?.foodType || 'any'
  });
  
  // Check if we have cached data
  if (tripCache.has(cacheKey)) {
    const cached = tripCache.get(cacheKey);
    const age = Date.now() - cached.timestamp;
    
    // Return cached data if less than 1 day old
    if (age < CACHE_DURATION) {
      console.log(`Using cached trip data for "${destination}" (age: ${Math.round(age / 3600000)}h)`);
      return cached.data;
    } else {
      console.log(`Cache expired for trip to "${destination}", generating fresh itinerary...`);
    }
  }
  
  const prompt = `Create a detailed ${duration}-day trip itinerary for ${destination} for ${persons} person(s) with a budget of ₹${budget}. Trip objective: ${objective || 'Leisure and sightseeing'}.

Preferences:
- Food type: ${preferences?.foodType || 'any'}
- Languages: ${preferences?.languageRanking?.join(', ') || 'any'}

Provide the response in the following JSON format ONLY (no additional text):

{
  "destination": "${destination}",
  "duration": ${duration},
  "itinerary": [
    {
      "day": 1,
      "title": "Brief day title",
      "activities": [
        {
          "time": "HH:MM AM/PM",
          "activity": "Activity description",
          "location": "Location name"
        }
      ]
    }
  ],
  "foodItinerary": [
    {
      "meal": "Breakfast/Lunch/Dinner/Snacks",
      "recommendation": "Food recommendations based on preference"
    }
  ],
  "famousPlaces": [
    "List of 5-10 famous places to visit"
  ],
  "dosAndDonts": {
    "dos": [
      "List of 5-8 do's for travelers"
    ],
    "donts": [
      "List of 5-8 don'ts for travelers"
    ]
  }
}

Make it detailed, practical, and budget-conscious. Include 5-7 activities per day with realistic timings.`;

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} to generate trip itinerary for "${destination}"...`);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response and parse JSON
      let jsonText = text.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }
      
      const data = JSON.parse(jsonText);
      
      // Cache the result with current timestamp
      tripCache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      console.log(`✓ Successfully cached trip itinerary for "${destination}"`);
      
      // Save cache to file
      saveCacheToFile();
      
      return data;
    } catch (error) {
      lastError = error;
      
      // Check if it's a rate limit or overload error (503, 429)
      if (error.status === 503 || error.status === 429) {
        console.log(`⚠ Server overloaded (attempt ${attempt}/${maxRetries}). Retrying in ${attempt * 2}s...`);
        
        // Wait before retrying (exponential backoff: 2s, 4s, 6s)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
      }
      
      // For other errors or final attempt, break the loop
      console.error('Gemini trip generation error:', error.message || error);
      break;
    }
  }
  
  // All retries failed, check for fallback cache
  if (tripCache.has(cacheKey)) {
    const cached = tripCache.get(cacheKey);
    const ageHours = Math.round((Date.now() - cached.timestamp) / 3600000);
    console.log(`⚠ Using expired cache data for trip to "${destination}" (${ageHours}h old) as fallback`);
    return cached.data;
  }
  
  // No cache available, throw the error
  throw lastError;
};

module.exports = {
  initializeGemini,
  getLocationInfo,
  generateTrip,
  isGeminiConfigured: () => GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE'
};
