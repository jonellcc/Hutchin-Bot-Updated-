const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "waifu",
  info: "Sends a random waifu image",
  dev: "zach",
  onPrefix: true,
  dmUser: true,
  usages: "",
  cooldowns: 5,
  category: "fun",

  onLaunch: async function ({ event, actions }) {
    try {
      // Step 1: Get random waifu image URL from Waifu.pics API
      const { data } = await axios.get("https://api.waifu.pics/sfw/waifu");

      if (!data || !data.url) {
        return actions.reply("❌ Failed to fetch waifu image.");
      }

      const imageUrl = data.url;

      // Step 2: Download image
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const tempFile = path.join(tempDir, `waifu_${Date.now()}.jpg`);
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(tempFile, imageResponse.data);

      // Step 3: Send the image as attachment
      await actions.reply({
        body: "Zach Love’s the waifu pics!",
        attachment: fs.createReadStream(tempFile)
      });

      // Step 4: Cleanup
      fs.unlinkSync(tempFile);

    } catch (error) {
      console.error("Error in randomwaifu:", error);
      actions.reply("❌ Something went wrong while fetching the image.");
    }
  }
};