import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

let geminiModel: GenerativeModel | null = null;

function getGeminiModel(): GenerativeModel {
  if (!geminiModel) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return geminiModel;
}

async function generateContent(prompt: string): Promise<string> {
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}

function extractJSON(text: string): unknown {
  // Try to extract JSON from markdown code blocks or raw JSON
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) return JSON.parse(jsonMatch[1].trim());
  // Try raw parse
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  const start = firstBrace >= 0 && (firstBracket < 0 || firstBrace < firstBracket) ? firstBrace : firstBracket;
  if (start >= 0) {
    const end = text.lastIndexOf(firstBrace >= 0 && start === firstBrace ? '}' : ']');
    if (end > start) return JSON.parse(text.substring(start, end + 1));
  }
  throw new Error('No valid JSON found in response');
}

// ─── Itinerary Generator ─────────────────────────────────────────────────────
export async function generateItinerary(params: {
  destination: string;
  days: number;
  budget: number;
  currency: string;
  travelStyle: string;
  travelers: number;
  interests?: string[];
  startDate?: string;
}) {
  const prompt = `You are an expert travel planner. Generate a detailed day-by-day itinerary for the following trip:

Destination: ${params.destination}
Duration: ${params.days} days
Total Budget: ${params.currency} ${params.budget}
Travel Style: ${params.travelStyle}
Number of Travelers: ${params.travelers}
Interests: ${params.interests?.join(', ') || 'general sightseeing'}
${params.startDate ? `Start Date: ${params.startDate}` : ''}

Return ONLY a valid JSON object with this exact structure:
{
  "tripSummary": "Brief exciting description of the trip",
  "estimatedCost": {
    "flights": number,
    "accommodation": number,
    "food": number,
    "activities": number,
    "transport": number,
    "total": number
  },
  "days": [
    {
      "dayNumber": 1,
      "date": "Day 1",
      "theme": "Arrival & Exploration",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity name",
          "description": "Detailed description",
          "category": "FOOD|HISTORICAL|ADVENTURE|CULTURAL|SHOPPING|BEACHES|HIKING|OTHER",
          "duration": 60,
          "cost": 0,
          "address": "Location address",
          "tips": "Helpful tip"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "Hotel name",
      "type": "Luxury|Budget|Mid-range",
      "pricePerNight": 100,
      "rating": 4.5,
      "area": "Area/district",
      "highlights": ["highlight1", "highlight2"]
    }
  ],
  "packingEssentials": ["item1", "item2"],
  "travelTips": ["tip1", "tip2"],
  "bestTimeToVisit": "Description of best time",
  "localCuisine": ["dish1", "dish2"],
  "emergencyContacts": {
    "police": "number",
    "ambulance": "number",
    "tourist_helpline": "number"
  }
}`;

  const text = await generateContent(prompt);
  return extractJSON(text);
}

// ─── Budget Estimator ─────────────────────────────────────────────────────────
export async function estimateBudget(params: {
  origin: string;
  destination: string;
  days: number;
  travelers: number;
  travelStyle: string;
  currency: string;
}) {
  const prompt = `You are a travel budget expert. Estimate a detailed budget for this trip:

From: ${params.origin}
To: ${params.destination}
Duration: ${params.days} days
Travelers: ${params.travelers}
Travel Style: ${params.travelStyle}
Currency: ${params.currency}

Return ONLY a valid JSON object:
{
  "currency": "${params.currency}",
  "travelStyle": "${params.travelStyle}",
  "breakdown": {
    "flights": { "min": number, "max": number, "recommended": number, "notes": "string" },
    "accommodation": { "min": number, "max": number, "recommended": number, "perNight": number, "notes": "string" },
    "food": { "min": number, "max": number, "recommended": number, "perDay": number, "notes": "string" },
    "activities": { "min": number, "max": number, "recommended": number, "notes": "string" },
    "localTransport": { "min": number, "max": number, "recommended": number, "notes": "string" },
    "shopping": { "min": number, "max": number, "recommended": number, "notes": "string" },
    "emergency": { "recommended": number, "notes": "string" }
  },
  "totalEstimate": { "budget": number, "recommended": number, "luxury": number },
  "savingTips": ["tip1", "tip2", "tip3"],
  "bestTimeForDeals": "string",
  "currencyTips": "string",
  "visaAndFees": { "visaCost": number, "notes": "string" }
}`;

  const text = await generateContent(prompt);
  return extractJSON(text);
}

// ─── Travel Chatbot ───────────────────────────────────────────────────────────
export async function chatWithAssistant(
  message: string,
  history: { role: 'user' | 'model'; content: string }[],
  context?: { destination?: string; budget?: number; travelStyle?: string }
) {
  const model = getGeminiModel();

  const systemContext = `You are Traveloop AI, a friendly and knowledgeable travel assistant. You help users plan trips, discover destinations, understand visa requirements, suggest activities, estimate budgets, and give travel tips. Be concise, helpful, and enthusiastic about travel.${
    context?.destination ? ` The user is planning a trip to ${context.destination}.` : ''
  }${context?.budget ? ` Their budget is approximately ${context.budget}.` : ''}${
    context?.travelStyle ? ` Travel style: ${context.travelStyle}.` : ''
  }

Always respond in a conversational, helpful tone. Format responses clearly with bullet points where appropriate.`;

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: systemContext }] },
      { role: 'model', parts: [{ text: 'I understand! I\'m Traveloop AI, ready to help you plan the perfect trip. What would you like to know?' }] },
      ...history.map((h) => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
    ],
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
}

// ─── Packing List Generator ───────────────────────────────────────────────────
export async function generatePackingList(params: {
  destination: string;
  days: number;
  travelStyle: string;
  season?: string;
  activities?: string[];
  weather?: string;
}) {
  const prompt = `Generate a comprehensive packing list for this trip:

Destination: ${params.destination}
Duration: ${params.days} days
Travel Style: ${params.travelStyle}
Season: ${params.season || 'unknown'}
Activities: ${params.activities?.join(', ') || 'general travel'}
Weather: ${params.weather || 'unknown'}

Return ONLY a valid JSON object:
{
  "categories": {
    "CLOTHES": [
      { "item": "item name", "quantity": 1, "essential": true, "notes": "optional note" }
    ],
    "ELECTRONICS": [],
    "DOCUMENTS": [],
    "MEDICINES": [],
    "ACCESSORIES": [],
    "TOILETRIES": [],
    "OTHER": []
  },
  "totalItems": number,
  "essentialItems": ["item1", "item2"],
  "tips": ["tip1", "tip2"]
}`;

  const text = await generateContent(prompt);
  return extractJSON(text);
}

// ─── City Recommendations ────────────────────────────────────────────────────
export async function getAIDestinationInsights(city: string, country: string) {
  const prompt = `Provide travel insights for ${city}, ${country}. Return ONLY valid JSON:
{
  "overview": "Brief exciting description",
  "bestTimeToVisit": "months/seasons",
  "avgDailyBudget": { "budget": number, "mid": number, "luxury": number },
  "mustSeeAttractions": [
    { "name": "string", "type": "string", "description": "string", "avgCost": number }
  ],
  "localCuisine": ["dish1", "dish2"],
  "transportTips": "string",
  "safetyTips": "string",
  "culturalTips": ["tip1", "tip2"],
  "hiddenGems": ["gem1", "gem2"],
  "popularMonths": ["Jan", "Feb"],
  "languageTips": "string",
  "currencyTips": "string"
}`;

  const text = await generateContent(prompt);
  return extractJSON(text);
}
