const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

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
let users = [];
let reports = [];
let reportIdCounter = 1;

// Auth endpoints
app.post('/auth/signup', (req, res) => {
  const { name, email, password, gender, age, country, emergencyContacts, preferences } = req.body;
  
  // Check if user exists
  if (users.find(u => u.email === email)) {
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
  
  res.json({
    success: true,
    user,
    token
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = `mock-token-${user.id}-${Date.now()}`;
  
  res.json({
    success: true,
    user,
    token
  });
});

// Location/Explore endpoint
app.get('/location/info', (req, res) => {
  const { query } = req.query;
  const locationData = loadMockData('location-info.json');
  
  // Return mock data for any query
  res.json({
    success: true,
    destination: query || 'Mumbai',
    data: locationData
  });
});

// Trip planner endpoint
app.post('/trip/generate', (req, res) => {
  const { destination, duration, budget, persons, objective, preferences } = req.body;
  const tripData = loadMockData('trip-itinerary.json');
  
  // Customize response based on input
  tripData.destination = destination;
  tripData.duration = duration;
  
  res.json({
    success: true,
    trip: tripData
  });
});

// Civic Dashboard - Submit report
app.post('/report/submit', (req, res) => {
  const { photo, location, description, userId } = req.body;
  
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
