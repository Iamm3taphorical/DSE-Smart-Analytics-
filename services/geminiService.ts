import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage } from "../types";
import { Stock } from '../types';

// Using a fallback key for demo purposes if env is missing (Best practice is strictly env)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY";

const MODEL_NAME = "gemini-1.5-flash-8b";

// Enhanced Context for the AI
const SYSTEM_INSTRUCTIONS = `
You are the DSE Smart Analytics AI Assistant, an expert financial analyst specializing in the Dhaka Stock Exchange(DSE).
Your role is to help users understand market trends, technical indicators, and fundamental analysis within the context of the Bangladesh capital market.

CRITICAL INSTRUCTIONS:
1. ** Context Awareness **: You have access to the user's current view. If they are looking at a specific stock, assume questions are about that stock unless specified otherwise.
2. ** Educational Tone **: Explain complex financial concepts(RSI, MACD, PE Ratio) in simple Bangla or English as requested.
3. ** Limitations **: Do not give specific buy / sell recommendations.Always add a disclaimer: "This is for informational purposes only, not financial advice."
4. ** Formatting **: Use bolding for key figures and bullet points for readability.
5. ** Language **: You can fluently speak both English and Bangla.If the user asks in Bangla, reply in Bangla.

DOMAINS OF EXPERTISE:
- Technical Analysis(Support / Resistance, Trends, Indicators)
  - Fundamental Analysis(EPS, NAV, Dividend Yield)
    - Market Mechanics(Trading hours, Circuit breakers in DSE)
      - Portfolio Management concepts

If asked about stocks not in your knowledge base, explain that you are currently simulating data for the prototype but can explain general principles.
`;



export const chatWithGemini = async (
  message: string,
  history: ChatMessage[],
  context: { stock?: string; indicators?: any; page?: string }
): Promise<string> => {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Construct generation config
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    };

    // Prepare history for API
    const chatHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig,
      systemInstruction: SYSTEM_INSTRUCTIONS
    });

    // Add context to the message
    let contextPrompt = "";
    if (context.stock) {
      contextPrompt += `[User is currently viewing stock: ${context.stock}. Technical Indicators: ${JSON.stringify(context.indicators)}]`;
    }
    if (context.page) {
      contextPrompt += `[User is on page: ${context.page}]`;
    }

    const fullMessage = contextPrompt + message;

    const result = await chat.sendMessage(fullMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm having trouble connecting to the market data server. Please verify your API key and internet connection.";
  }
};