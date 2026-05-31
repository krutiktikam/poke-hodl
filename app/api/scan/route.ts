import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, series } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: "Gemini API Key is missing. Please restart your dev server if you just added it to .env.local" 
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Extract base64 data
    const base64Data = image.split(",")[1];
    if (!base64Data) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }
    
    const isPocket = series === 'pocket';

    // Tailored prompt for Standard vs Pocket
    const prompt = `
      Identify this Pokémon card. The user is scanning a ${isPocket ? 'DIGITAL (Pokémon TCG Pocket mobile game)' : 'PHYSICAL'} card.
      
      Guidelines:
      - Name identification: Extract the full Pokémon name exactly as it appears.
      - ${isPocket 
          ? 'Digital Traits: Look for "Diamond" or "Star" rarity icons (e.g. 1-4 Diamonds, 1-3 Stars, or Crown). Digital cards often have cleaner, bright borders.' 
          : 'Physical Traits: Look for the set symbol or 3-letter set identifier code (e.g. "SVI", "PAL", "OBF", "MEW") in the bottom corners of the card frame.'}
      - Card ID: Look for the number and set total (e.g., 35/119) usually in the bottom corners.
      - Attack Name: Identify one clearly visible attack name (e.g., "Labyrinth of Shadows").

      Return ONLY a JSON object with these fields:
      - name: The full name of the Pokémon
      - number: The card number (e.g. "35")
      - total: The total cards in the set (e.g. "119")
      - set: The name of the expansion set
      - setCode: ${isPocket ? 'null' : 'The 3-letter set code (e.g. "SVI")'}
      - attack: One clearly visible attack name
      
      If you cannot identify it, return an empty JSON object {}.
      Do not include any markdown formatting or extra text.
    `;

    // Prioritize gemini-1.5-flash as it has the most generous free tier quota
    const modelsToTry = [
      "gemini-1.5-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-pro"
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting scan with model: ${modelName} (v1)...`);
        const model = genAI.getGenerativeModel(
          { model: modelName },
          { apiVersion: "v1" }
        );
        
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg",
            },
          },
        ]);

        const response = await result.response;
        let text = response.text();
        console.log(`Success with ${modelName}. Raw Response:`, text);
        
        text = text.replace(/```json|```/g, "").trim();
        const cardData = JSON.parse(text);
        return NextResponse.json(cardData);
      } catch (err: any) {
        console.error(`Model ${modelName} failed:`, err.message);
        lastError = err;
        if (err.message.includes("404") || err.message.includes("not supported") || err.message.includes("429")) {
          continue;
        } else {
          throw err;
        }
      }
    }

    throw lastError || new Error("All vision models failed to identify the card.");
  } catch (error: any) {
    console.error("Scan API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
