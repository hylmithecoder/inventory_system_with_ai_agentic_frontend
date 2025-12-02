import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyDnL8wiuQz8t0i9EtHshEfcUXa_G62KGI4"
});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log("\nAnswer : ", response.text);
}

main();