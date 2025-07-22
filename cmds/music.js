const axios = require("axios");
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

      const fileStream = await axios.get(download, { responseType: "stream" });

      await api.setMessageReaction("✅", reactTarget, event.senderID, true);

      const message =
        `🎵 𝗠𝘂𝘀𝗶𝗰 𝗥𝗲𝘀𝘂𝗹𝘁\n━━━━━━━━━━━━━━━━━━\n` +
        `🎶 Title: ${video.title}\n` +
        `🕒 Duration: ${video.timestamp}\n` +
        `🎤 Artist: ${video.author.name}\n` +
        `📺 YouTube Link: ${video.url}\n` +
        `⬇️ Download: ${download}`;

      api.sendMessage({ body: message, attachment: fileStream.data }, event.threadID, event.messageID);
    } catch (err) {
      await api.setMessageReaction("❌", reactTarget, event.senderID, true);
      api.sendMessage("❌ Unexpected error occurred.", event.threadID, event.messageID);
    }
  }
};