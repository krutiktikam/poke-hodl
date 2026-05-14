import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Using Gemini API Key:", apiKey ? "Present (Starts with " + apiKey.substring(0, 5) + ")" : "MISSING");

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
    
    console.log("Image payload size:", base64Data.length);

    // Using modern identifiers found via API discovery for this specific key
    const modelsToTry = ["gemini-flash-latest", "gemini-2.0-flash", "gemini-pro-latest", "gemini-2.5-flash"];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting scan with model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // ... rest of prompt and generation logic ...

        const prompt = `
          Identify this Pokémon card. 
          
          Guidelines:
          - Some cards (like Mega Evolutions) have highly stylized or holographic names. 
          - If the name is hard to read, look at the attack names (middle of card) or the rule text (bottom) for clues.
          - The card number and set total are usually in the bottom-left or bottom-right corners (e.g., 35/119).
          - Identify whether it is a legacy "EX" or a modern "ex" card.
          - Look for the 3-letter set identifier code (e.g. "SVI", "PAL", "OBF", "MEW") often found in the bottom corner of modern cards or PTCGL screenshots.

          Return ONLY a JSON object with these fields:
          - name: The full name of the Pokémon (e.g. "M Gengar-EX" or "Mega Gengar ex")
          - number: The card number (e.g. "35")
          - total: The total cards in the set (e.g. "119")
          - set: The name of the expansion set if visible
          - setCode: The 3-letter set code (e.g. "SVI") if visible
          - attack: One clearly visible attack name (e.g. "Labyrinth of Shadows")
          
          If you cannot identify it, return an empty JSON object {}.
          Do not include any markdown formatting or extra text.
        `;

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
        // Continue to next model if it's a 404, support error, or quota/rate limit error
        if (err.message.includes("404") || 
            err.message.includes("not supported") || 
            err.message.includes("429") || 
            err.message.includes("quota")) {
          continue;
        } else {
          throw err; // Re-throw if it's a different kind of error (like auth)
        }
      }
    }

    throw lastError || new Error("All vision models failed to identify the card.");
  } catch (error: any) {
    console.error("Scan API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
