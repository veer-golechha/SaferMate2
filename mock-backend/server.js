const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const geminiService = require('./services/gemini');

const app = express();
const PORT = 3000;

// Initialize Gemini
const geminiConfigured = geminiService.initializeGemini();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helper to load mock data
const loadMockData = (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// Mock user database (in-memory for MVP)
let users = [
  {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    password: 'test123',
    gender: 'male',
    age: 25,
    country: 'India',
    emergencyContacts: [
      { id: 1, name: 'Emergency Contact', phone: '9876543210' }
    ],
    preferences: {
      foodType: 'veg',
      languages: ['English', 'Hindi']
    },
    createdAt: new Date().toISOString()
  }
];
let reports = [];
let reportIdCounter = 1;

// Auth endpoints
app.post('/auth/signup', (req, res) => {
  const { name, email, password, gender, age, country, emergencyContacts, preferences } = req.body;
  
  console.log('\n📝 SIGNUP REQUEST:', email);
  
  // Check if user exists
  if (users.find(u => u.email === email)) {
    console.log('❌ User already exists\n');
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const user = {
    id: users.length + 1,
    name,
    email,
    gender,
    age,
    country,
    emergencyContacts,
    preferences: preferences || { foodType: 'veg', languages: ['English', 'Hindi'] },
    createdAt: new Date().toISOString()
  };
  
  users.push(user);
  
  const token = `mock-token-${user.id}-${Date.now()}`;
  
  console.log('✅ User created successfully\n');
  
  res.json({
    success: true,
    user,
    token
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('\n🔐 LOGIN REQUEST:', email);
  
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.log('❌ Invalid credentials\n');
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = `mock-token-${user.id}-${Date.now()}`;
  
  console.log('✅ Login successful\n');
  
  res.json({
    success: true,
    user,
    token
  });
});

// Update user profile
app.put('/auth/profile', (req, res) => {
  const { userId, name, gender, age, country, profileImage, emergencyContacts, preferences } = req.body;
  
  console.log('\n👤 PROFILE UPDATE REQUEST for user:', userId);
  
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    console.log('❌ User not found\n');
    return res.status(404).json({ error: 'User not found' });
  }
  
  users[userIndex] = {
    ...users[userIndex],
    name,
    gender,
    age,
    country,
    profileImage,
    emergencyContacts,
    preferences
  };
  
  console.log('✅ Profile updated successfully\n');
  
  res.json({
    success: true,
    user: users[userIndex]
  });
});

// Location/Explore endpoint
app.get('/location/info', async (req, res) => {
  const { query } = req.query;
  
  console.log('\n🗺️  LOCATION INFO REQUEST:', query);
  
  if (!query) {
    console.log('❌ Destination query missing\n');
    return res.status(400).json({ error: 'Destination query is required' });
  }
  
  try {
    let data;
    
    // Use Gemini if configured, otherwise use mock data
    if (geminiService.isGeminiConfigured()) {
      console.log('🤖 Fetching from Gemini AI...');
      data = await geminiService.getLocationInfo(query);
      console.log('✅ Data retrieved successfully\n');
    } else {
      console.log('⚠️  Using mock data...');
      data = loadMockData('location-info.json');
      console.log('✅ Mock data loaded\n');
    }
    
    res.json({
      success: true,
      destination: query,
      data: data
    });
  } catch (error) {
    console.error('❌ Location info error:', error);
    
    // Return error response instead of falling back to mock data
    res.status(503).json({
      success: false,
      error: 'Difficulty getting current data for the location. Please try later.',
      destination: query
    });
  }
});

// Trip planner endpoint
app.post('/trip/generate', async (req, res) => {
  const { destination, duration, budget, persons, objective, preferences } = req.body;
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📍 TRIP GENERATION REQUEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Destination:', destination);
  console.log('Duration:', duration, 'days');
  console.log('Budget:', `₹${budget}`);
  console.log('Persons:', persons);
  console.log('Objective:', objective || 'Not specified');
  console.log('Food Preference:', preferences?.foodType || 'Not specified');
  console.log('Languages:', preferences?.languageRanking?.join(', ') || 'Not specified');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    let tripData;
    
    // Use Gemini if configured, otherwise use mock data
    if (geminiService.isGeminiConfigured()) {
      console.log('🤖 Using Gemini AI to generate trip itinerary...');
      tripData = await geminiService.generateTrip(req.body);
      console.log('✅ Successfully generated trip with Gemini AI\n');
    } else {
      console.log('⚠️  Gemini not configured, using mock data...');
      tripData = loadMockData('trip-itinerary.json');
      
      // Customize response based on input
      tripData.destination = destination;
      tripData.duration = duration;
      console.log('✅ Returning mock data\n');
    }
    
    res.json({
      success: true,
      trip: tripData
    });
  } catch (error) {
    console.error('❌ Trip generation error:', error);
    
    // Fallback to mock data on error
    console.log('⚠️  Falling back to mock data due to error...\n');
    const tripData = loadMockData('trip-itinerary.json');
    tripData.destination = destination;
    tripData.duration = duration;
    
    res.json({
      success: true,
      trip: tripData,
      warning: 'Generated using fallback data due to API error'
    });
  }
});

// Civic Dashboard - Submit report
app.post('/report/submit', (req, res) => {
  const { photo, location, description, userId } = req.body;
  
  console.log('\n📸 CIVIC REPORT SUBMISSION');
  console.log('User ID:', userId);
  console.log('Description:', description);
  console.log('Location:', location);
  
  const report = {
    id: reportIdCounter++,
    userId: userId || 1,
    photo,
    location,
    description,
    status: 'Submitted',
    timestamp: new Date().toISOString()
  };
  
  reports.push(report);
  
  console.log('✅ Report submitted successfully\n');
  
  res.json({
    success: true,
    message: 'Report submitted successfully',
    report
  });
});

// Civic Dashboard - Get user reports
app.get('/report/list', (req, res) => {
  const { userId } = req.query;
  
  const userReports = reports.filter(r => r.userId == (userId || 1));
  
  res.json({
    success: true,
    reports: userReports
  });
});

// Translate - Text translation
app.post('/translate/text', (req, res) => {
  const { text, sourceLang, targetLang } = req.body;
  
  // Mock translation responses
  const translations = {
    'Hello': { 'Hindi': 'नमस्ते', 'Tamil': 'வணக்கம்', 'Telugu': 'నమస్కారం' },
    'Thank you': { 'Hindi': 'धन्यवाद', 'Tamil': 'நன்றி', 'Telugu': 'ధన్యవాదాలు' },
    'Where is the bathroom?': { 'Hindi': 'बाथरूम कहाँ है?', 'Tamil': 'குளியலறை எங்கே?', 'Telugu': 'బాత్రూమ్ ఎక్కడ ఉంది?' }
  };
  
  const translated = translations[text]?.[targetLang] || `[${targetLang} translation of: ${text}]`;
  
  res.json({
    success: true,
    originalText: text,
    translatedText: translated,
    sourceLang,
    targetLang
  });
});

// Translate - Voice translation
app.post('/translate/voice', (req, res) => {
  const { audioData, sourceLang, targetLang } = req.body;
  
  // Mock voice translation
  const mockTranscript = 'Where is the nearest hospital?';
  const mockTranslation = targetLang === 'Hindi' ? 'निकटतम अस्पताल कहाँ है?' : `[${targetLang} translation]`;
  
  res.json({
    success: true,
    transcript: mockTranscript,
    translatedText: mockTranslation,
    sourceLang,
    targetLang,
    audioUrl: 'mock-audio-url.mp3'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock Backend Server running on http://localhost:${PORT}`);
  console.log(`📍 Endpoints available:`);
  console.log(`   - POST /auth/signup`);
  console.log(`   - POST /auth/login`);
  console.log(`   - GET  /location/info?query=<destination>`);
  console.log(`   - POST /trip/generate`);
  console.log(`   - POST /report/submit`);
  console.log(`   - GET  /report/list?userId=<id>`);
  console.log(`   - POST /translate/text`);
  console.log(`   - POST /translate/voice`);
});
