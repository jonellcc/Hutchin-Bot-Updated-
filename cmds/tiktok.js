const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "tiktok",
  usedby: 0,
  onPrefix: true,
  dev: "Jonell Magallanes",
  cooldowns: 30,

  onLaunch: async function ({ api, event, target }) {
    try {
      const searchQuery = target.join(" ");
      if (!searchQuery) {
        api.sendMessage("Usage: tiktok <search text>", event.threadID);
        return;
      }

      const loadingMsg = await api.sendMessage({
        body: "⏳ Searching TikTok...",
        edit: [
          ["🔍 Finding videos...", 1000],
          ["📡 Connecting to TikTok servers...", 1000],
          ["📦 Fetching result...", 1000]
        ]
      }, event.threadID);

      const response = await axios.get(`https://ccprojectsapis.zetsu.xyz/api/tiktok/searchvideo?keywords=${encodeURIComponent(searchQuery)}`);
      const videos = response.data.data.videos;

      if (!videos || videos.length === 0) {
        
        api.sendMessage("No videos found for the given search query.", event.threadID);
        return;
      }

      const videoData = videos[0];
      const videoUrl = videoData.play;
      const message =
        `🎬 𝗧𝗶𝗸𝘁𝗼𝗸 𝗩𝗶𝗱𝗲𝗼 𝗥𝗲𝘀𝘂𝗹𝘁\n${global.line}\n` +
        `👤 Posted by: ${videoData.author.nickname}\n` +
        `🔗 Username: @${videoData.author.unique_id}\n\n` +
        `📝 Title: ${videoData.title}`;

      const filePath = path.join(__dirname, `/cache/tiktok_video.mp4`);
      const writer = fs.createWriteStream(filePath);
      const videoResponse = await axios({
        method: "get",
        url: videoUrl,
        responseType: "stream"
      });

      videoResponse.data.pipe(writer);

      writer.on("finish", () => {
      
        api.sendMessage(
          {
            body: message,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => fs.unlinkSync(filePath)
        );
      });

    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("❌ An error occurred while processing your TikTok request.", event.threadID);
    }
  }
};