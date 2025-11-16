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
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const CACHE_FILE_PATH = path.join(__dirname, '../data/location-cache.json');

// Load cache from file
const loadCacheFromFile = () => {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const fileData = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      const cacheData = JSON.parse(fileData);
      
      // Convert plain object back to Map
      Object.entries(cacheData).forEach(([key, value]) => {
        locationCache.set(key, value);
      });
      
      console.log(`Loaded ${locationCache.size} cached locations from file`);
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
    
    // Convert Map to plain object for JSON serialization
    const cacheData = Object.fromEntries(locationCache);
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2), 'utf8');
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

  try {
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
    console.log(`Cached fresh data for "${destination}"`);
    
    // Save cache to file
    saveCacheToFile();
    
    return data;
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Check if we have expired cache data as fallback
    if (locationCache.has(cacheKey)) {
      console.log(`Using expired cache data for "${destination}" as fallback`);
      return locationCache.get(cacheKey).data;
    }
    
    throw error;
  }
};

module.exports = {
  initializeGemini,
  getLocationInfo,
  isGeminiConfigured: () => GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE'
};
