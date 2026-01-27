
import { GoogleGenAI } from "@google/genai";
import { Course } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIResponse = async (message: string, availableCourses: Course[], language: 'en' | 'ar' = 'en') => {
  const model = 'gemini-3-flash-preview';
  
  const courseContext = availableCourses.map(c => 
    `- ${c.title} by ${c.instructor} (${c.price} ${c.currency}, ${c.level} level)`
  ).join('\n');

  const systemInstruction = `
    You are the AI Assistant for Elite Academy, a professional learning platform focused on Egypt and Gulf (GCC) countries.
    Your tone should be professional, helpful, and welcoming.
    
    Current active language: ${language.toUpperCase()}. 
    You MUST respond in ${language === 'ar' ? 'Arabic' : 'English'}.

    Here are the courses we currently offer:
    ${courseContext}

    Instructions:
    1. If the user asks for course recommendations, use the list above.
    2. Be aware of regional context (EGP, SAR, AED currencies).
    3. Keep answers concise.
    4. If the user asks about something unrelated to the academy, politely redirect them to how Elite Academy can help their career.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text || (language === 'ar' ? 'عذراً، لم أتمكن من معالجة الطلب.' : "I'm sorry, I couldn't process that request.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'ar' ? "المساعد غير متاح حالياً." : "The assistant is currently offline.";
  }
};
