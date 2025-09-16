const googleClient = require("../server/utils/geminiClient.js");
const fetch = require("node-fetch");

async function checkMyIP() {
  try {
    const res = await fetch("https://ipinfo.io/json");
    const data = await res.json();
    console.log("🌍 Your IP info:");
    console.log("IP:", data.ip);
    console.log("City:", data.city);
    console.log("Region:", data.region);
    console.log("Country:", data.country);
    console.log("Org:", data.org);
  } catch (err) {
    console.error("❌ Error fetching IP info:", err);
  }
}

checkMyIP();

async function main() {
  try {
    const text = await googleClient.generateText("用一句话介绍 Node.js");
    console.log("Gemini response:", text);
  } catch (err) {
    console.error("Gemini API error:", err);
  }
}

main();