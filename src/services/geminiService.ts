import { GoogleGenAI, Type } from "@google/genai";
import { Narration, Choice, GameTheme } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const THEME_DESCRIPTIONS: Record<GameTheme, string> = {
  bunker: "sebuah bunker bawah tanah futuristik yang gelap dan mencekam setelah kegagalan sistem.",
  zombie: "sebuah kota yang hancur karena wabah mayat hidup (zombie). Suasana penuh darah, jeritan, dan ketakutan.",
  virus_mlw: "sebuah dunia digital/simulasi yang terinfeksi oleh virus 'MLW' (Malware). Realitas mulai hancur, kode-kode terlihat di langit, dan entitas digital memburu user."
};

export async function generateNextRound(
  previousNarrations: Narration[],
  playerActionId: string,
  choices: Choice[],
  theme: GameTheme = 'bunker'
): Promise<{ narration: string; nextChoices: Choice[] }> {
  const selectedChoice = choices.find(c => c.id === playerActionId);
  const history = previousNarrations.slice(-5).map(n => `[${n.type.toUpperCase()}] ${n.text}`).join("\n");

  const prompt = `
    Kamu adalah XENON, narator AI sinematik dan menegangkan untuk game survival thriller multiplayer.
    Tema saat ini adalah: ${THEME_DESCRIPTIONS[theme]}
    
    RIWAYAT TERBARU (Gunakan sebagai referensi konteks):
    ${history}
    
    TINDAKAN TERAKHIR PEMAIN:
    "${selectedChoice?.text || "Tindakan tidak dikenal"}" (Level risiko: ${selectedChoice?.risk || "tidak diketahui"})
    
    TUGAS:
    1. Hasilkan narasi sinematik sangat singkat (maks 2 kalimat) yang mendeskripsikan konsekuensi SEGERA dari tindakan pemain.
    2. Sarankan 3 pilihan survival baru untuk ronde berikutnya.
    
    RESPONSE FORMAT (JSON):
    {
      "narration": "Teks narasi singkat Bahasa Indonesia.",
      "nextChoices": [
        { "id": "c1", "text": "Pilihan 1", "risk": "low" },
        { "id": "c2", "text": "Pilihan 2", "risk": "medium" },
        { "id": "c3", "text": "Pilihan 3", "risk": "high" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narration: { type: Type.STRING },
            nextChoices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  risk: { type: Type.STRING, enum: ["low", "medium", "high"] }
                },
                required: ["id", "text", "risk"]
              }
            }
          },
          required: ["narration", "nextChoices"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    // Explicitly check for safety ratings or blocked content
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Fallback if API fails
    return {
      narration: `Sesuatu yang tak terduga terjadi. ${errorMessage.includes('safety') ? 'XENON mendeteksi anomali transmisi (Konten diblokir).' : 'Kegelapan semakin pekat (API Error).'}`,
      nextChoices: [
        { id: "c1", text: "Terus maju.", risk: "low" },
        { id: "c2", text: "Berhenti dan dengarkan.", risk: "medium" },
        { id: "c3", text: "Lari secepat mungkin.", risk: "high" }
      ]
    };
  }
}
