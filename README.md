# EcoSense AI - Carbon Footprint Awareness Platform

EcoSense AI is a full-stack sustainability application designed to help individuals understand, track, and reduce their carbon footprint through simple actions, automated utility bill scanning, and personalized AI suggestions.

## How It Solves the Challenge

EcoSense AI directly solves the sustainability tracking challenge by implementing a unified, three-step journey:
1. **Understand**: Users manually enter travel, dietary, and power statistics, or scan physical utility bills using the built-in Gemini Vision OCR endpoint. The application immediately calculates their Carbon Health Score (0-100) and displays a detailed graphical breakdown of resource drivers.
2. **Reduce**: Once calculated, the platform consults the AI Carbon Coach. Powered by Gemini 1.5 Flash, the coach generates personalized, context-aware savings actions, a 7-day green transition challenge, and estimates potential score improvements.
3. **Track**: Users can switch to the tracking Dashboard to trace their score progress timeline (weekly/monthly scopes), view percentage splits, and review historical log archives.

## Tech Stack

- **Client**: React (Vite), Tailwind CSS (v4.0), Chart.js
- **Server**: Node.js, Express, Helmet, Cors
- **AI Core**: Google Gemini 1.5 Flash (`@google/generative-ai`)
- **Testing**: Jest, React Testing Library, Supertest
- **Code Quality**: ESLint (with `eslint-plugin-jsx-a11y` for accessibility checks)

---

## Project Structure

```text
ecosense-ai/
├── client/                 # Frontend React Application
│   ├── public/             # Static public assets
│   ├── src/                # Source code
│   │   ├── components/     # UI components
│   │   │   ├── common/     # Reusable inputs, buttons, etc.
│   │   │   └── layout/     # Navigation, headers, layouts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React Context providers
│   │   ├── utils/          # Helper utilities and formatting
│   │   ├── __tests__/      # Jest and React Testing Library tests
│   │   ├── App.jsx         # App main component
│   │   ├── main.jsx        # Mounting and entry point
│   │   └── index.css       # Tailwind directives
│   ├── babel.config.js     # Transpiles JS/JSX for Jest testing
│   ├── eslint.config.js    # Modern ESLint Flat Config (including accessibility)
│   ├── jest.config.js      # Client Jest configuration
│   ├── jest.setup.js       # Jest setup and custom matchers
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite compilation configurations
│
├── server/                 # Backend Node.js/Express Application
│   ├── src/
│   │   ├── config/         # System and database configurations
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom Express middleware (auth, validator, error)
│   │   ├── routes/         # Express API routes
│   │   ├── utils/          # Utility functions (AI helper, formatting)
│   │   ├── __tests__/      # Server integration and unit tests
│   │   ├── app.js          # Express app initialization
│   │   └── server.js       # Application entry point
│   ├── eslint.config.js    # Backend ESLint Flat Config
│   ├── jest.config.js      # Server Jest configuration
│   └── package.json        # Backend dependencies
│
├── .env.example            # Multi-layer environmental variable template
├── .gitignore              # Repository git ignore rules
└── README.md               # Setup and project documentation (This file)
```

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### 1. Clone & Set Environment Variables
Copy `.env.example` to the root folder as `.env` and fill in the required keys:

```bash
cp .env.example .env
```

Ensure you get a Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/) and paste it in the `.env` file under `GEMINI_API_KEY`.

### 2. Install Dependencies

You need to install dependencies for both the frontend (client) and the backend (server).

#### Client Setup:
```bash
cd client
npm install
```

#### Server Setup:
```bash
cd ../server
npm install
```

---

## Running the Application

For a full local development experience, run both the backend API server and frontend development server concurrently.

### Start the Server (API)
The backend server uses `nodemon` to automatically restart on changes.

```bash
cd server
npm run dev
```
By default, the server will start on [http://localhost:5000](http://localhost:5000).

### Start the Client (Frontend)
The client uses Vite for fast hot-module reloading.

```bash
cd client
npm run dev
```
By default, the Vite development server will start on [http://localhost:5173](http://localhost:5173).

---

## Running Tests

Tests are written using Jest for both client and server.

### Run Client Tests
```bash
cd client
npm test
```

### Run Server Tests
```bash
cd server
npm test
```

---

## Linting & Accessibility

To maintain code standards and web accessibility compliance:

### Run Client Linting (React + Accessibility Audit)
```bash
cd client
npm run lint
```

### Run Server Linting
```bash
cd server
npm run lint
```
