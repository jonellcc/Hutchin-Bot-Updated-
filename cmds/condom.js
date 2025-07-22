const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const GRAPH_API_BASE = "https://graph.facebook.com";
const FB_HARDCODED_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
const CONDOM_API_BASE = "https://condom-7oho.onrender.com/api/condom";

function getProfilePictureURL(userID, size = [512, 512]) {
  const [width, height] = size;
  return `${GRAPH_API_BASE}/${userID}/picture?width=${width}&height=${height}&access_token=${FB_HARDCODED_TOKEN}`;
}

module.exports = {
  name: "condom",
  info: "Make fun of your friends using crazy condom fails",
  dev: "Samir (converted by zzach)",
  onPrefix: true,
  dmUser: false,
  nickName: [],
  usages: "/condom @user",
  cooldowns: 5,

  onLaunch: async function ({ event, actions }) {
    const { mentions } = event;
    const mentionIDs = Object.keys(mentions);

    if (mentionIDs.length === 0) {
      actions.react("❌");
      return actions.reply("😶 Please mention someone to use the condom meme.");
    }

    const targetID = mentionIDs[0];
    const targetName = mentions[targetID].replace('@', '').trim();
    const avatarURL = getProfilePictureURL(targetID);
    const encodedURL = `${CONDOM_API_BASE}?avatar=${encodeURIComponent(avatarURL)}`;

    try {
      const response = await axios.get(encodedURL, {
        responseType: "arraybuffer",
        timeout: 10000
      });

      const buffer = response.data;
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filename = `condom_${crypto.randomBytes(6).toString("hex")}.jpg`;
      const filepath = path.join(cacheDir, filename);

      fs.writeFileSync(filepath, buffer);

      await actions.reply({
        body: `Ops Crazy Condom Fails 😆 @${targetName}`,
        attachment: fs.createReadStream(filepath),
        mentions: [{ tag: `@${targetName}`, id: targetID }]
      });

      fs.unlinkSync(filepath);
      actions.react("😆");
    } catch (err) {
      console.error("[CONDOM ERROR]", err.message);
      actions.react("❌");
      actions.reply("❌ Failed to generate the condom meme image.");
    }
  }
};