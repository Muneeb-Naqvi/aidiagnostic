import fetch from "node-fetch";
import 'dotenv/config';

const FIREWORK_API_KEY = process.env.FIREWORKS_API_KEY;
const FIREWORK_ENDPOINT = "https://api.fireworks.ai/inference/v1/chat/completions";

const modelsToTest = [
  "accounts/fireworks/models/llama-v3p1-70b-instruct",
  "llama-v3p1-70b-instruct",
  "accounts/fireworks/models/llama-v3p2-3b-instruct",
  "llama-v3p2-3b-instruct",
  "accounts/fireworks/models/gpt-oss-20b",
  "gpt-oss-20b",
  "accounts/fireworks/models/qwen2p5-72b-instruct",
  "accounts/fireworks/models/mixtral-8x7b-instruct",
  "accounts/fireworks/models/firefunction-v2"
];

async function testModels() {
  console.log("--- STARTING FIREWORKS MODEL VERIFICATION ---");
  for (const model of modelsToTest) {
    try {
      console.log(`\nTesting model: ${model}`);
      const response = await fetch(FIREWORK_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FIREWORK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Say 'Hello' and your model name." }
          ],
          max_tokens: 50,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error(`❌ FAILED (${response.status}): ${data.error?.message || "Unknown error"}`);
      } else {
        const text = data.choices?.[0]?.message?.content;
        console.log(`✅ SUCCESS! Output: "${text || "EMPTY CONTENT"}"`);
        if (!text) {
          console.log("Full JSON:", JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error(`❌ ERROR: ${err.message}`);
    }
  }
}

testModels();
