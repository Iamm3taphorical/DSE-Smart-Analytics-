import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

// ============================================
// Gemini AI Service
// ============================================

// @ts-ignore
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

// Check if API key is configured
export const isGeminiConfigured = (): boolean => {
  return API_KEY.length > 0 && API_KEY !== 'your-api-key-here';
};

// Initialize Gemini only if API key exists
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (isGeminiConfigured()) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
  }
}

// System instructions for the AI
const SYSTEM_INSTRUCTIONS = `You are DSE Analytics AI, an expert financial analyst specializing in the Bangladesh stock market (Dhaka Stock Exchange).

Your key responsibilities:
1. Provide clear, educational explanations of technical analysis concepts
2. Help users understand stock market terminology and indicators
3. Analyze market trends using data provided in context
4. Explain pattern formations and their implications
5. Never provide direct buy/sell recommendations - only educational insights

Key rules:
- Always include a disclaimer that this is educational, not financial advice
- Focus on Bangladesh market context (DSE, CSE, BSEC regulations)
- Use simple language accessible to retail investors
- Reference technical indicators (RSI, MACD, Moving Averages) when relevant
- Prices are in BDT (৳)

Bangladesh market trading hours: Sun-Thu, 10:00 AM - 2:30 PM BST
Major indices: DSEX (broad), DS30 (blue chips), DSES (shariah)

When given context about a specific stock, incorporate it into your analysis.`;

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

let chatHistory: ChatMessage[] = [];

interface AnalysisContext {
  stock?: string;
  page?: string;
  indicators?: {
    rsi?: number;
    macd?: { value: number; signal: number };
    sma20?: number;
    sma50?: number;
    sentiment?: string;
  };
}

export const chatWithGemini = async (
  message: string,
  history: any[], // Accepts frontend chat history
  context?: AnalysisContext
): Promise<string> => {
  // Check if Gemini is configured
  if (!isGeminiConfigured() || !model) {
    return `⚠️ **AI Assistant Not Configured**

To enable the AI assistant, please add your Gemini API key:

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a \`.env.local\` file in the project root
3. Add: \`VITE_GEMINI_API_KEY=your-api-key-here\`
4. Restart the development server

In the meantime, here's what I can tell you about market analysis:

${context?.stock ? `**${context.stock}** is currently being viewed.` : ''}
${context?.indicators?.rsi ? `RSI is at ${context.indicators.rsi.toFixed(1)} - ${context.indicators.rsi > 70 ? 'potentially overbought' : context.indicators.rsi < 30 ? 'potentially oversold' : 'neutral territory'}.` : ''}

*This is a demo response. Configure your API key for full AI analysis.*`;
  }

  try {
    // Build context string
    let contextStr = '';
    if (context) {
      contextStr = '\n\n[Current Context]\n';
      if (context.stock) contextStr += `Currently viewing: ${context.stock}\n`;
      if (context.page) contextStr += `Page: ${context.page}\n`;
      if (context.indicators) {
        contextStr += 'Technical Indicators:\n';
        if (context.indicators.rsi) contextStr += `- RSI (14): ${Number(context.indicators.rsi).toFixed(2)}\n`;
        if (context.indicators.macd) {
          contextStr += `- MACD: ${Number(context.indicators.macd.value).toFixed(2)} (Signal: ${Number(context.indicators.macd.signal).toFixed(2)})\n`;
        }
        if (context.indicators.sma20) contextStr += `- SMA 20: ৳${Number(context.indicators.sma20).toFixed(2)}\n`;
        if (context.indicators.sma50) contextStr += `- SMA 50: ৳${Number(context.indicators.sma50).toFixed(2)}\n`;
        if (context.indicators.sentiment) contextStr += `- Sentiment: ${context.indicators.sentiment}\n`;
      }
    }

    const fullMessage = `${SYSTEM_INSTRUCTIONS}\n\n${contextStr}\n\nUser question: ${message}`;

    // Map frontend history to Gemini format (excluding the very recent user msg which is usually passed as 'message' arg, but let's see how startChat uses it)
    // startChat history excludes the current prompt.
    // Frontend history passed here includes ALL messages usually? 
    // AIAssistant calls setMessages first, then calls chatWithGemini.
    // So 'history' contains the current user message.
    // We should filter it out or use history up to now.
    // Actually, model.startChat takes previous history.

    const geminiHistory = history
      .filter(msg => msg.id !== 'welcome') // Remove local welcome
      .map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }));

    // If history contains the current message, we should remove it from geminiHistory to avoid duplication or pass it as 'message' only.
    // Usually 'startChat' is for *prior* turns.
    // We'll use the prompt 'fullMessage' as the new turn.

    const chat = model.startChat({
      history: geminiHistory.slice(0, -1), // Exclude last message which is likely the user's prompt we are handling
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(fullMessage);
    const response = result.response.text();

    return response;
  } catch (error: any) {
    console.error('Gemini API error:', error);

    // Provide helpful error messages
    if (error.message?.includes('API_KEY_INVALID')) {
      return `❌ **Invalid API Key**

The Gemini API key appears to be invalid. Please check:
1. The key is correctly copied from Google AI Studio
2. The key is active and not expired
3. You've restarted the server after adding the key`;
    }

    if (error.message?.includes('QUOTA_EXCEEDED')) {
      return `⚠️ **API Quota Exceeded**

You've reached the API rate limit. Please:
1. Wait a few minutes before trying again
2. Consider upgrading your API plan for higher limits`;
    }

    if (error.message?.includes('SAFETY')) {
      return `I apologize, but I cannot respond to that query due to safety guidelines. Please rephrase your question focusing on market analysis or educational topics.`;
    }

    return `⚠️ **Connection Error**

I'm having trouble connecting to the AI service. This could be due to:
- Network connectivity issues
- API service temporarily unavailable

Please try again in a moment.

*Tip: You can still explore the charts and analysis tools while I reconnect.*`;
  }
};

export const clearChatHistory = (): void => {
  chatHistory = [];
};

export const getChatHistory = (): ChatMessage[] => {
  return [...chatHistory];
};