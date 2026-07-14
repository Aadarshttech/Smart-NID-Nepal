<div align="center">
  <h1>🇳🇵 Smart NID Nepal — स्मार्ट दर्ता</h1>
  <p><strong>AI-powered National ID (NID) pre-enrollment assistant for Nepal</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
  [![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://developer.chrome.com/docs/extensions/)
  
  > 🚧 **Work in Progress / Under Construction** 🚧  
  > *This project is currently under active development. Features, UI, and APIs are subject to change.*
</div>

<br />

## 📖 Overview

**Smart NID Nepal** is an AI-powered browser extension and web application designed to streamline the complex citizenship registration process for the National ID in Nepal.

By leveraging the cutting-edge **Google Gemini Vision API**, this application completely automates the tedious data entry process. Users simply upload a photo of their physical Nepali Citizenship Certificate (नागरिकता प्रमाणपत्र), and the AI instantly reads, translates, and extracts all the necessary fields (both in Nepali and English) to automatically pre-fill the official Department of National ID and Civil Registration (DONIDCR) enrollment form.

## ✨ Key Features

- **Instant OCR Extraction:** Accurately extracts complex bilingual data (Devanagari and Latin) directly from citizenship cards.
- **Automated Form Injection:** A companion Chrome Extension that automatically injects the extracted data directly into the official government portal.
- **Smart Data Conversion:** Automatically converts dates from Bikram Sambat (BS) to Anno Domini (AD) and handles location mappings seamlessly.
- **Premium User Interface:** A beautifully crafted, responsive Light Mode UI built with Tailwind CSS that feels official and trustworthy.
- **Privacy First:** Built as a secure architecture where image processing happens temporarily in memory. **No files or personal data are ever persisted or logged.**

---

## 🛠️ Tech Stack & Architecture

This project is built using a modern, scalable monorepo-style structure consisting of three main layers:

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Client** | React 19, Vite, TypeScript, Tailwind CSS v4, Zustand | The primary user interface for uploading and verifying the extracted data. |
| **Backend API** | Node.js, Express, TypeScript, Google Gemini (2.5 Flash) | Handles secure communication with the Gemini Vision API for advanced OCR extraction. |
| **Browser Extension** | JavaScript (Manifest V3) | A Chrome Extension that acts as a bridge between the Frontend Client and the DONIDCR web portal for auto-filling forms. |

---

## 🏗️ Extension Architecture (How it Works)

The Smart NID Helper browser extension serves as a vital bridge between our modern React application and the legacy government portal. It operates using the following data flow:

1. **Content Script (Client-Side):** `content-app.js` runs on our React client (`localhost:*` or production domain). It acts as a listener for custom events dispatched by the React app when a user successfully extracts and verifies citizenship data.
2. **Background Service Worker:** Once data is captured by the client content script, it's sent to `background.js` (the central router of the extension) using Chrome's message passing API (`chrome.runtime.sendMessage`). The background script securely stores this data temporarily in local storage.
3. **Target Content Script:** `content-donidcr.js` is injected exclusively into the official DONIDCR enrollment portal (`enrollment.donidcr.gov.np`). 
4. **DOM Injection & Auto-Fill:** When the user navigates to the government portal, they can use the extension popup to trigger the fill process. `content-donidcr.js` fetches the pending data from storage and maps the extracted JSON fields directly to the specific HTML input elements on the government form. It automatically fills them out and triggers the necessary DOM change/input events so the site's internal validation registers the data correctly.

This decoupled architecture ensures that our advanced React UI and Gemini OCR logic remain entirely independent of the government's website infrastructure, interacting strictly through standard browser extension APIs.

---

## 📂 Project Structure

```text
nid auto/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components (DropZone, JsonViewer, Tabs)
│   │   ├── pages/       # Application views (UploadPage)
│   │   ├── store/       # Zustand state management
│   │   └── utils/       # Helpers for validation and location parsing
│
├── server/              # Express backend application
│   ├── src/
│   │   ├── ai/          # Gemini API integration & extraction logic
│   │   ├── prompts/     # Highly-tuned system prompts for OCR
│   │   └── routes/      # API endpoints
│
├── extension/           # Chrome Extension
│   ├── icons/           # Extension assets
│   ├── background.js    # Service worker
│   ├── content-app.js   # Content script for the frontend client
│   ├── content-donidcr.js # Content script for the government portal
│   └── manifest.json    # Extension configuration
│
└── README.md            # You are here!
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A **Google Gemini API Key** (Get one from [Google AI Studio](https://aistudio.google.com/apikey))

### 1. Setup Environment Variables

Navigate to the `server` directory and set up your environment variables:

```bash
cd server
cp .env.example .env
```
*Edit the `.env` file and insert your Gemini API Key.*

### 2. Install Dependencies

Install the necessary packages for both the server and the client:

```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 3. Run the Development Servers

You will need two terminal windows to run both the backend and frontend simultaneously.

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

### 4. Install the Chrome Extension

To enable the auto-fill capabilities on the official portal, you must load the unpacked extension in Chrome:

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right corner).
3. Click **Load unpacked** in the top left.
4. Select the `extension` folder located in this repository.

---

## 🎯 Usage Guide

1. Ensure your local client, server, and the Chrome extension are running.
2. Open the Smart NID Web Client at [http://localhost:5173](http://localhost:5173).
3. Upload a clear image of a Nepali Citizenship Certificate.
4. Review the extracted data on the dashboard and make any manual corrections if necessary.
5. Click on the extension or the action button to automatically inject the validated data into the DONIDCR portal.

---

## 🔒 Privacy & Security

We take data privacy very seriously. 
- All image processing is done in volatile memory.
- We do not store, log, or share any personal identification details or images submitted to the system. 
- Read our full Privacy Policy [here](extension/privacy_policy.md) or visit [aadarshapandit.com.np](https://aadarshapandit.com.np).

---

## 🗺️ Roadmap / Phases

- [x] **Phase 1:** Project scaffold + core citizenship OCR extraction.
- [x] **Phase 2:** Multi-tab enrollment form and validation.
- [x] **Phase 3:** Chrome extension integration for DOM injection.
- [ ] **Phase 4:** AI review gate & human-in-the-loop verification.
- [ ] **Phase 5:** AI appointment suggestion & scheduling.
- [ ] **Phase 6:** Polish, accessibility improvements, and deployment.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the OCR accuracy, enhance the UI, or expand the capabilities of the extension, feel free to open a pull request or submit an issue.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <p>Built with ❤️ for a smarter Nepal.</p>
</div>
