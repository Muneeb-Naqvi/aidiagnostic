import fetch from "node-fetch";
import 'dotenv/config';

const FIREWORK_API_KEY = process.env.FIREWORKS_API_KEY;

async function listModels() {
    try {
        console.log("--- FETCHING AVAILABLE MODELS ---");
        const response = await fetch("https://api.fireworks.ai/inference/v1/models", {
            headers: {
                "Authorization": `Bearer ${FIREWORK_API_KEY}`,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const models = data.data.map(m => m.id);
        console.log("Total models found:", models.length);

        // Filter for common instruct/chat models
        const chatModels = models.filter(id =>
            id.includes("instruct") ||
            id.includes("chat") ||
            id.includes("llama-3.1") ||
            id.includes("qwen") ||
            id.includes("mixtral")
        );

        console.log("\nTop recommended chat/instruct models:");
        chatModels.slice(0, 50).forEach(m => console.log("- " + m));

    } catch (err) {
        console.error("❌ Error listing models:", err.message);
    }
}

listModels();
