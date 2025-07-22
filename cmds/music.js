const axios = require("axios");
const fs = require("fs");
const path = require("path");
const yts = require("yt-search");

module.exports = {
  name: "music",
  info: "Music",
  permission: 0,
  cooldowns: 10,
  onPrefix: true,

  async onLaunch({ api, event }) {
    const query = event.body?.split(" ").slice(1).join(" ");
    if (!query) return api.sendMessage("❌ Usage: music <song name>", event.threadID, event.messageID);

    const reactTarget = event.messageID;
    await api.setMessageReaction("⏱️", reactTarget, event.senderID, true);

    try {
      const result = await yts(query);
      if (!result.videos.length) {
        await api.setMessageReaction("❌", reactTarget, event.senderID, true);
        return api.sendMessage("❌ No results found.", event.threadID, event.messageID);
      }

      const video = result.videos[0];
      const videoUrl = video.url;

      const res = await axios.get(`http://ccproject.serv00.net/ytdl2.php?url=${videoUrl}`);
      const { title, download } = res.data;

      const dir = path.join(__dirname, "cache/music");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const safeTitle = title.replace(/[^\w\s]/gi, "").substring(0, 100);
      const filePath = path.join(dir, `${Date.now()}-${safeTitle}.mp3`);

      const writer = fs.createWriteStream(filePath);
      const fileStream = await axios({ url: download, method: "GET", responseType: "stream" });
      fileStream.data.pipe(writer);

      writer.on("finish", async () => {
        await api.setMessageReaction("✅", reactTarget, event.senderID, true);

        const message =
          `🎵 𝗠𝘂𝘀𝗶𝗰 𝗥𝗲𝘀𝘂𝗹𝘁\n━━━━━━━━━━━━━━━━━━\n` +
          `🎶 Title: ${video.title}\n` +
          `🕒 Duration: ${video.timestamp}\n` +
          `🎤 Artist: ${video.author.name}\n` +
          `📺 YouTube Link: ${video.url}\n` +
          `⬇️ Download: ${download}`;

        api.sendMessage({ body: message, attachment: fs.createReadStream(filePath) }, event.threadID, () => {
          setTimeout(() => fs.existsSync(filePath) && fs.unlinkSync(filePath), 60_000);
        });
      });

      writer.on("error", async () => {
        await api.setMessageReaction("❌", reactTarget, event.senderID, true);
        api.sendMessage("❌ Error downloading music.", event.threadID, event.messageID);
      });

    } catch {
      await api.setMessageReaction("❌", reactTarget, event.senderID, true);
      api.sendMessage("❌ Unexpected error occurred.", event.threadID, event.messageID);
    }
  }
};