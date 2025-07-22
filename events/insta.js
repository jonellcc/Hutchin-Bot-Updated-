const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: 'instadl',
  ver: '1.0',
  prog: 'Jonell Magallanes',

  onEvents: async function ({ api, event, messageID }) {
    if (event.type !== 'message') return;

    const message = event.body?.trim();
    const match = message.match(/https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/i);
    if (!match) return;

    const igUrl = match[0];
    const cacheDir = path.join(__dirname, "..", "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    try {
      const { data } = await axios.get(`https://jonell01-ccprojectsapihshs.hf.space/api/instadl?url=${encodeURIComponent(igUrl)}`);
      if (!data.mp4url) return api.sendMessage("No video found.", event.threadID, messageID);

      const filename = `instadl_${Date.now()}.mp4`;
      const filepath = path.join(cacheDir, filename);

      const videoRes = await axios.get(data.mp4url, { responseType: "stream" });
      const writer = fs.createWriteStream(filepath);

      videoRes.data.pipe(writer);

      writer.on("finish", () => {
        const bold = global.fonts.bold("📥 Instagram Video");
        const info = `${bold}\n━━━━━━━━━━━━━━━━━━\n${data.title}\n\n📏 ${data.size} | ⏱ ${data.duration} | 🏷 ${data.quality}`;
        api.sendMessage({ body: info, attachment: fs.createReadStream(filepath) }, event.threadID, messageID);
      });

      writer.on("error", (err) => {
        console.error("File write error:", err);
        api.sendMessage("Failed to save the video.", event.threadID, messageID);
      });

    } catch (err) {
      console.error("API Error:", err.message);
      api.sendMessage("Failed to download Instagram video.", event.threadID, messageID);
    }
  }
}; 