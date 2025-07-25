const axios = require("axios");

module.exports = {
  name: "ai",
  usedby: 0,
  onPrefix: true,
  dev: "Jonell Magallanes",
  cooldowns: 5,

  onLaunch: async function ({ api, event, target }) {
    const ask = target.join(" ");
    const isReply = event.messageReply;
    let thinking = await api.sendMessage("Thinking...", event.threadID);

    try {
      if (isReply && isReply.attachments.length > 0) {
        const urls = isReply.attachments.map(att => {
          return att.url || att.largePreviewUrl || att.previewUrl || att.thumbnailUrl || null;
        }).filter(Boolean);

        if (urls.length === 0) {
          return await api.editMessage("❌ No valid image URL found in the reply.", thinking.messageID);
        }

        const imageUrl = urls[0];
        const response = await axios.get(`https://kaiz-apis.gleeze.com/api/gemini-flash-2.0?q=${encodeURIComponent(ask || "Describe this image")}&uid=${event.senderID}&imageUrl=${encodeURIComponent(imageUrl)}&apikey=9092efe8-8724-4e3d-87d9-dd7024df431d`);
        return await api.editMessage(response.data.response, thinking.messageID);
      }

      if (!ask) {
        return await api.editMessage("Please enter a question after the command.", thinking.messageID);
      }

      const res = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o?ask=${encodeURIComponent(ask)}&uid=${event.senderID}&webSearch=off&apikey=9092efe8-8724-4e3d-87d9-dd7024df431d`);
      await api.editMessage(res.data.response, thinking.messageID);

    } catch (err) {
      await api.editMessage("❌ An error occurred while fetching the response.", thinking.messageID);
    }
  }
};