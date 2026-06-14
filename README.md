🌍 Problem Statement

Carbon emissions from everyday activities — transport, food choices, and energy consumption — are major contributors to climate change. Most individuals lack awareness of their personal impact and don't know where to start reducing it.

EcoSense AI solves this by combining real-time carbon calculations with Google Gemini AI to deliver personalized, actionable insights — not generic sustainability tips.


✨ Features

🧮 Carbon Footprint Calculator


Input transport (km/week), food habits, and electricity usage
Calculates CO₂ emissions using research-based emission factors
Generates a Carbon Health Score (0–100)


📸 AI Bill Scanner (Gemini Vision)


Upload electricity or fuel bill images
Gemini 1.5 Flash extracts kWh/fuel data automatically
Auto-fills the calculator — no manual entry needed


🤖 AI Carbon Coach (Gemini Text)


Personalized analysis referencing your exact emission numbers
Identifies your top emission source
Generates 5 specific, actionable recommendations
Creates a 7-day improvement challenge
Predicts your score improvement if recommendations are followed


📊 Dashboard & History


Carbon Health Score gauge with trend indicators
Weekly and monthly progress charts (Chart.js)
Category breakdown: Transport vs Food vs Electricity
Full history table with sort functionality



🛠️ Tech Stack

LayerTechnologyFrontendReact 18 + Vite + Tailwind CSSBackendNode.js + ExpressAIGoogle Gemini 1.5 Flash (Text + Vision)ChartsChart.jsTestingJest + React Testing LibrarySecurityHelmet.js + express-rate-limit + express-validatorDeploymentGoogle Cloud Run + Firebase Hosting


🚀 Getting Started

Prerequisites


Node.js 18+
Google Gemini API Key (Get one here)


Installation

bash# Clone the repository
git clone https://github.com/SHAILJA8879/Ecosensor-AI.git
cd Ecosensor-AI

# Install all dependencies
npm run install-all

# Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Run development servers (frontend + backend)
npm run dev

Open http://localhost:5173 in your browser.

Environment Variables

envPORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:5000


📁 Project Structure

ecosense-ai/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calculator.jsx      # Carbon footprint form
│   │   │   ├── BillScanner.jsx     # Gemini Vision upload
│   │   │   ├── AICoach.jsx         # AI recommendations
│   │   │   ├── Dashboard.jsx       # Charts & history
│   │   │   └── ScoreGauge.jsx      # Score visualization
│   │   ├── utils/
│   │   │   ├── carbonCalculator.js # Emission calculations
│   │   │   └── historyStorage.js   # localStorage management
│   │   └── __tests__/             # Jest test suites
├── server/                     # Express backend
│   ├── routes/
│   │   ├── carbonCoach.js         # Gemini text endpoint
│   │   └── billScanner.js         # Gemini vision endpoint
│   ├── middleware/
│   │   └── validate.js            # Input validation
│   └── index.js                   # Server entry point
├── .env.example
├── .gitignore
└── README.md


🔒 Security


All API keys stored in environment variables (never hardcoded)
Helmet.js for HTTP security headers
Rate limiting on all AI endpoints (10 requests/15 min)
Input validation and sanitization via express-validator
File upload validation (type + size limits)
CORS configured for production domains only



♿ Accessibility


WCAG AA compliant color contrast (4.5:1 ratio)
Full keyboard navigation support
aria-labels on all interactive elements
aria-live regions for dynamic content updates
Skip navigation link
Semantic HTML throughout
Screen reader compatible charts with text alternatives



🧪 Testing

bash# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

Test coverage includes:


Carbon calculation utility functions
localStorage history management
API route validation
Bill Scanner file validation
Component rendering and interaction



🌐 Live Demo

🔗 View Live App


🤝 How It Solves the Challenge

Challenge RequirementEcoSense AI SolutionHelp individuals understand carbon footprintCalculator + category breakdown dashboardTrack emissions over timeHistory with weekly/monthly chartsReduce through simple actionsAI Coach with 7-day challengePersonalized insightsGemini references your exact numbersSimple actions3-input calculator, one-click bill scan


📝 License

MIT License — feel free to use and build upon this project.


👨‍💻 Author

Shailja — B.Tech CSE Student
Built for Prompt War Challenge 3 — Carbon Footprint Awareness Platform
