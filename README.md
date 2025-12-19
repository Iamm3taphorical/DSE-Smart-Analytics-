# DSE Smart Analytics 🚀
### Advanced Stock Analysis & Portfolio Management for Dhaka Stock Exchange
</div>

## 📖 Overview
DSE Smart Analytics is a comprehensive platform designed for investors in the Dhaka Stock Exchange. It combines real-time data simulation with advanced technical analysis, portfolio management, and AI-driven insights to help users make informed trading decisions.

## ✨ Key Features

### 📊 Advanced Analysis Mode
- **11 Analysis Methods**: Analyze stocks using Candlestick patterns, Heikin-Ashi, Renko, Kagi, Point & Figure, and more.
- **Technical Indicators**: Built-in Moving Averages, RSI, MACD, Stochastic, and Fibonacci retracements.
- **Pattern Recognition**: Automatically detects classic chart patterns (Head & Shoulders, Triangles) and candlestick formations (Stars, Engulfing).
- **Interpretability**: Provides clear, human-readable explanations, confidence scores, and market psychology insights for every signal.

### 💼 Portfolio Management
- **Trade Simulation**: Buy and Sell stocks with a virtual cash balance (Simulated Trading).
- **Performance Tracking**: Track Day Gain, Total Gain/Loss, and overall Portfolio Value in real-time.
- **Transaction History**: Detailed log of all trades, deposits, and withdrawals.
- **Cash Management**: Manage your virtual wallet with Deposit and Withdraw options.

### 🔔 Smart Alerts & Watchlist
- **Custom Alerts**: Set price thresholds with "Above" or "Below" conditions.
- **Notifications**: Get instant In-App toasts and Email notifications (simulated) when targets are hit.
- **Watchlist & Favorites**: Keep track of your favorite stocks for quick access.

### 👤 User Profile & Persistence
- **Custom Profiles**: Update your avatar, name, and preferences.
- **Supabase Integration**: Data is securely stored in Supabase (PostgreSQL), ensuring your portfolio and settings are synced across devices.
- **Data Fallback**: Works seamlessly with LocalStorage if Supabase is not configured.

### 🤖 AI Market Assistant
- **Gemini Powered**: Integrated Google Gemini AI to answer market queries and provide context-aware insights.
- **Smart Context**: The AI understands which stock you are viewing and the active analysis indicators.

### 🌍 Internationalization
- **Bilingual Interface**: Fully translated into English and Bangla (বাংলা).
- **Theme Support**: Dark and Light mode support.

## 🛠️ Technology Stack
- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons
- **State Management**: React Context API
- **Backend/DB**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Charts**: Recharts, Custom SVG renderers

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dse-smart-analytics.git
   cd dse-smart-analytics
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory and add:
   ```env
   # Gemini AI (Required for Chatbot)
   VITE_GEMINI_API_KEY=your_gemini_api_key

   # Supabase (Required for Cloud Persistence)
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 📝 License
This project is licensed under the MIT License.

## 👨‍💻 Developer
Developed with ❤️ by **Mahir Dyan**
[GitHub Profile](https://github.com/iamm3taphorical)
