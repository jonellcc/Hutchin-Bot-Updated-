const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "meme",
  info: "Sends a random meme from Popcat API",
  dev: "Your Name",
  onPrefix: true,
  dmUser: false,
  usages: "",
  category: "fun",

  onLaunch: async function ({ api, event }) {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, 'meme.jpg');

    try {
      const res = await axios.get("https://api.popcat.xyz/v2/meme");
      if (res.data.error || !res.data.message) throw new Error("API Error");

      const meme = res.data.message;
      const imageUrl = meme.content.imageHigh || meme.content.image;

      const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(tempFile, Buffer.from(imgRes.data, 'binary'));

      const caption = `📸 ${meme.title}\n👤 Author: ${meme.author}\n📎 Link: ${meme.link}\n⬆️ Upvotes: ${meme.misc.upvotes}`;

      api.sendMessage({
        body: caption,
        attachment: fs.createReadStream(tempFile)
      }, event.threadID, () => {
        fs.unlinkSync(tempFile);
      }, event.messageID);

    } catch (err) {
      console.error("Meme fetch error:", err);
      api.sendMessage("❌ Failed to fetch meme. Try again later.", event.threadID, null, event.messageID);
    }
  }
};