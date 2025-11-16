# **SafarMate — MVP Product Requirements Document (PRD)**

**Version:** 1.0 (MVP Scope Only)
**Platform:** Android (React Native, Android 11+)
**Goal:** Build a functional demo-ready travel & safety companion app for India, with minimal backend (mocked responses allowed).
**Primary Users:** Travelers & general public within India.

---

# **1. MVP Feature Overview (Strict Scope)**

The MVP includes the following core surfaces:

1. **Authentication**
2. **Onboarding**
3. **Home Tab + Profile/Settings**
4. **Emergency Tab**
5. **Explore**
6. **Trip Planner**
7. **Civic Dashboard (Report + Track)**
8. **Translate**

Anything not listed is **intentionally excluded**.

---

# **2. User Flow Summary**

### 2.1 First-time user

1. Launch app → Splash
2. Signup → Provide name, gender, age, country, at least 1 emergency contact
3. Onboarding screens → Feature overview
4. Home tab (default screen)

### 2.2 Returning user

1. Launch app → Splash
2. Login → Home tab

---

# **3. Detailed Feature Requirements**

---

# **3.1 Authentication (Login / Signup)**

### **Signup Screen Requirements**

* Input fields:

  * Name (text)
  * Gender (dropdown: Male, Female, Other)
  * Age (numeric)
  * Country of Origin (dropdown or free text)
  * Emergency Contacts (minimum 1; fields: name + phone number)
  * Email (text)
  * Password (text, masked)
* Validation:

  * All fields mandatory except more than 1 emergency contact
  * Emergency contacts: at least 1 required, valid phone number format
  * Password minimum length 6
* Actions:

  * Create account
  * Navigate to login

### **Login Screen Requirements**

* Input fields:

  * Email
  * Password
* Actions:

  * Login
  * Navigate to signup

### **Authentication Notes**

* For MVP, backend may be mocked; token persistence via local storage.

---

# **3.2 Onboarding Experience**

### **Purpose**

Educate user about app features and basic interactions.

### **Minimum 3–4 Slides**

* Slide 1: Explore places with fun facts, weather, AQI
* Slide 2: Plan trips using AI itinerary
* Slide 3: Report civic issues
* Slide 4: Emergency SOS and offline survival features

### **Interaction**

* Swipe left/right
* “Skip” and “Get Started” buttons

---

# **3.3 Main App Layout (Bottom Navigation)**

### **Two primary tabs:**

1. **Home**
2. **Emergency**

### **Persistent bottom navigation bar**

* Home
* Emergency

(Other internal features are reached from Home quick links.)

---

# **3.4 Home Tab**

### **Top Section**

* Greeting (“Hello, <Name>”) top-left
* Profile Picture top-right (default silhouette)

  * Tapping opens Settings screen

### **Quick Action Tiles (4)**

1. **Explore New Location**
2. **Plan Trip**
3. **Civic Dashboard**
4. **Translate**

### **Behavior**

* Tiles open respective modules/screens.
* Greeting adapts to time of day (optional but simple).

---

# **3.5 Settings Screen**

### **Editable Profile Fields**

* Name
* Gender
* Age
* Country of origin
* Profile picture (upload via camera/gallery)

### **Emergency Contacts**

* Add new contact
* Edit existing contact
* Must always have *at least one* contact
* Name + phone number validation

### **Preferences**

* Food type:

  * Veg
  * Non-Veg
* Language ranking:

  * User sorts preferred languages in order (drag-and-drop or simple picker list)
  * Used for translation defaults and trip suggestions

---

# **3.6 Emergency Tab**

### **Main Components**

* **Big Red SOS Button** (centered)
* **Two Quick Links:**

  * Offline Map (destination map, if downloaded)
  * Survival Guide (preloaded text content)

### **SOS Interaction Flow**

1. User taps SOS → confirmation modal appears:

   * “This will send your location to your emergency contacts. Continue?”
   * Options: Cancel / Confirm
2. On confirm:

   * Fetch current GPS coordinates
   * Open SMS composer with:

     * Recipients = emergency contacts
     * Prefilled message:

       ```
       SOS! I need help. My location is <Google Maps link>.
       ```
3. App logs SOS event locally (timestamp + location)

### **Notes**

* No background tracking
* No auto SMS sending; only SMS composer is opened
* No police integration backend; SMS is the only mandatory behavior

---

# **3.7 Explore New Location**

### **Input**

* Destination selected or typed by user

### **Displayed Information (from mock API)**

* **Fun Facts** (3–5 items)
* **Famous Foods**
* **Famous Places to Visit**
* **Weather**

  * Temperature (°C)
  * Conditions (sunny, cloudy, etc.)
* **AQI** (0–500 scale)
* **Civic Metric (0–5)**

  * Represents cleanliness / infrastructure condition
  * Single integer/float (e.g., 3.7)

### **Simple Layout**

* Header image or map preview (optional)
* Sectioned list with clear labels

---

# **3.8 Trip Planner**

### **Input Form**

* Destination (text field or search)
* Duration of trip (days)
* Budget
* Number of persons
* Optional trip objective (text)
* Preferences (food, language ranking pre-filled from settings)

### **Output (Mock AI-Generated)**

* **Day-by-day schedule** (with time blocks and activities)
* **Food itinerary**
* **Famous places to visit**
* **Do’s and Don’ts**
* **Button: “Download Offline Map”**

  * Auto-downloads destination MBTiles (mocked for MVP)

### **Behavior**

* Result page scrollable
* Stored locally as a trip object (optional for MVP)

---

# **3.9 Civic Dashboard**

### **Two Functions**

1. **Report Issue**
2. **Track Issue Status**

---

### **3.9.1 Report Issue**

* Open camera → capture image
* Auto-record geolocation
* Add short description (text input)
* Submit
* Show confirmation screen

**Data Fields:**

* Photo (URI)
* Location (lat, lng)
* Description (text)
* Timestamp

### **3.9.2 Track Issue Status**

* List of user's reports:

  * Small thumbnail of photo
  * Description preview
  * Status indicator:

    * Submitted
    * In Review
    * Resolved
      (All mocked for MVP)

---

# **3.10 Translate**

### **Capabilities**

* Text-to-text translation
* One-shot voice input
* TTS output

### **Supported Languages**

* Popular Indian languages (Hindi, Marathi, Gujarati, Tamil, Telugu, Bengali, Kannada, Malayalam, Punjabi, English)

### **Flows**

#### **A. Text Translation**

* Select source & target languages
* Input text
* Output:

  * Translated text
  * “Play translation” button (TTS)

#### **B. One-shot Voice Translation**

* Tap “Record”
* Capture audio (10–20 sec limit)
* Send to mock API
* Response:

  * Transcript text
  * Translated text
  * Play translation audio

### **Notes**

* Real AWS Transcribe/Translate/Polly will be integrated later
* For MVP, all responses are mocked

---

# **4. Non-Functional MVP Requirements**

## **Performance**

* App should load in <3 seconds on Android 11+.
* Offline map file load (mock) should not freeze UI.

## **Permissions (minimal required)**

* Camera — civic reports, profile picture
* Microphone — one-shot translation
* Location — SOS & Explore & Civic reports
* Storage access (scoped) — offline maps

## **Error Handling**

* No internet → show “Offline mode” banner
* Missing permissions → show modal with explanation
* If location unavailable → allow SOS without location (text only)

## **Data Persistence**

* Auth token stored locally
* User profile/preferences stored locally
* Trips and reports may be locally cached (optional)

## **Backend**

* For MVP:

  * All APIs can be mocked locally or embedded fixtures.
* For future real backend:

  * REST endpoints expected for auth, trip planning, civic reports, translation, and location data.

---

# **5. MVP Prioritization (What to Build First)**

### **Tier 1 — Core Functional (must-have)**

1. Authentication (Login/Signup)
2. Onboarding
3. Home tab + profile/avatar button
4. Emergency tab (SOS + offline map + survival guide)
5. Settings screen
6. Explore screen
7. Trip planner input + result page
8. Civic dashboard (report + track)
9. Translate (text + one-shot voice)

### **Tier 2 — Polishing**

1. Greeting logic on Home
2. Caching recent trips
3. Offline map file states
4. Clean UI transitions & icons

### **Tier 3 — Optional (Only if time remains)**

1. Splash animation
2. Light/dark theme
3. Local notifications

---

# **6. API Requirements (Mocked for MVP)**

### **Expected Endpoints (for mock server or JSON fixtures):**

* `/auth/signup`
* `/auth/login`
* `/location/info?query=`
* `/trip/generate`
* `/report/submit`
* `/report/list`
* `/translate/text`
* `/translate/voice`

### **All outputs can be static JSON for demo.**

---

# **7. Success Criteria for MVP**

The MVP is considered complete when:

1. A user can **sign up, log in**, and access the app.
2. The **Home tab** loads with greeting + 4 quick actions.
3. The **Settings** screen fully updates stored user details.
4. The **Emergency tab** shows SOS button → opens SMS composer with prefilled text + location.
5. A user can **explore** a location and see:

   * Fun facts
   * Foods
   * Places
   * AQI
   * Civic metric
6. A user can **plan a trip** and see:

   * Itinerary
   * Foods
   * Do’s/Don’ts
7. A user can **report a civic issue** with a photo + location.
8. A user can **translate text or recorded voice**.
9. The app functions fully using mocked backend responses.

---

# **8. Deliverables for AI-Assisted Development**

This PRD is structured so that tools like GitHub Copilot can generate:

* React Native screens
* Navigation structure
* Local mock API services
* Data schemas
* UI components
* Permission/request flows
* Forms and validation logic
* Offline map manager
* SMS composer flow
* Camera + mic integration