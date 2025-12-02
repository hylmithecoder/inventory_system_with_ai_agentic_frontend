// src/app/services/chatbotGemini.ts

export async function sendMessageToGemini(message: string, apiKey: string) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey;
  const body = {
    contents: [{ parts: [{ text: message }] }]
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error("Gagal menghubungi Gemini API");
    const data = await response.json();
    // Gemini response format: data.candidates[0].content.parts[0].text
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada balasan dari AI.";
  } catch (err) {
    return "Terjadi kesalahan: " + err;
  }
}
