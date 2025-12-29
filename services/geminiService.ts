
import { GoogleGenAI, Type } from "@google/genai";
import { ProductDetails, PriceResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const identifyProductFromImage = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          { text: "What is the exact product in this image? Provide only the product name and model." },
        ],
      },
    });
    return response.text || "Unknown Product";
  } catch (error) {
    console.error("Error identifying product:", error);
    throw error;
  }
};

export const fetchPriceComparisons = async (productName: string): Promise<ProductDetails> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find real-time prices and store links for: ${productName}. 
      Include major retailers like Amazon, Walmart, Target, Best Buy, etc. 
      Identify the current best price.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            image: { type: Type.STRING, description: "Direct URL to a product image" },
            prices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  currency: { type: Type.STRING },
                  source: { type: Type.STRING },
                  url: { type: Type.STRING },
                },
                required: ["title", "price", "source", "url"],
              },
            },
          },
          required: ["name", "prices"],
        },
      },
    });

    const data = JSON.parse(response.text) as ProductDetails;
    
    // Process and sort prices
    if (data.prices && data.prices.length > 0) {
      data.prices.sort((a, b) => a.price - b.price);
      data.prices[0].isCheapest = true;
    }
    
    // Add grounding links if available
    const groundingChunks = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      // Logic to enhance results with search citations could go here
    }

    return data;
  } catch (error) {
    console.error("Error fetching prices:", error);
    throw error;
  }
};
