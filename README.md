# Waste to Rewards

♻️ **Smart Waste Management for a Greener Tomorrow**

Waste to Rewards is a full-stack, AI-powered web application designed to encourage eco-friendly habits through gamification and machine learning waste classification. It features three interconnected dashboards catering to different roles in the waste management ecosystem.

## 🏗️ Architecture & Technical Stack

The application is built entirely on a modern frontend stack, using local ML models for real-time processing without backend latency.

### Core Technologies
- **Framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui (Radix UI primitives)
- **Routing**: React Router DOM (v6)
- **Data Visualization**: Recharts (for analytics and telemetry data)
- **Icons**: Lucide React

### Artificial Intelligence & Machine Learning
- **Engine**: TensorFlow.js (`@tensorflow/tfjs`) running entirely in-browser.
- **Model**: MobileNet v2 (`@tensorflow-models/mobilenet`)
- **Implementation**: The app loads the MobileNet model into the user's browser, requesting a live media stream (Webcam) or parsing an uploaded image. It processes the image tensor directly on the edge device to classify the object.
- **Custom Mapping Layer**: The application maps the 1,000+ ImageNet classes returned by MobileNet down into our 5 core waste categories (`plastic`, `glass`, `metal`, `cardboard`, `paper`) using a custom semantic mapping algorithm for high accuracy.

### IoT Sensor Simulation (Telemetry)
The application leverages advanced state management to simulate hardware endpoints (smart bins).
- Simulates Ultrasonic (UI-2) sensors for proximity/drop detection.
- Simulates Load Cell (W-4) sensors for weight fluctuation detection.
- Uses `setInterval` loops inside React `useEffect` hooks to simulate live telemetry data streaming to the Authentication Dashboard.

## 📱 Dashboards

1. **User Dashboard (`/dashboard`)**
   - Implements Gamification logic (Points to next rank algorithms).
   - Local state management for dynamically greeting the authenticated user.
   - Recharts implementation for visualizing historical point earnings.

2. **Authentication / Ops Dashboard (`/auth-dashboard`)**
   - Live view of fleet telemetry.
   - Renders a complex data table featuring simulated IoT bins.
   - Includes state-driven UI for "Warning" and "Critical" bin fill limits, simulating real-time dispatch events.

3. **Global Admin Dashboard (`/admin-dashboard`)**
   - High-level system analytics.
   - Utilizes advanced `AreaChart` and `BarChart` from Recharts to visualize user acquisition over time and aggregate waste processing.
   - Renders a mock geographic activity map using CSS animations.

## 🚀 Getting Started Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/bhavanihbvb/rewardsapp.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web application at `http://localhost:8080`.

## 🌐 Deployment
The application is pre-configured for instant deployment on Vercel. 
- Build step: `npm run build` (generates static assets via Vite)
- Live Demo: [https://rewardsapp-zeta.vercel.app](https://rewardsapp-zeta.vercel.app)
