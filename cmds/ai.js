const axios = require("axios");

module.exports = {
  name: "ai",
  usedby: 0,
  onPrefix: true,
  dev: "Jonell Magallanes",
  cooldowns: 5,

  onLaunch: async function ({ api, event, target }) {
    const ask = target.join(" ");
    if (!ask) {
      return api.sendMessage("Please enter a question after the command.", event.threadID, event.messageID);
    }

    try {
      const thinking = await api.sendMessage("Thinking...", event.threadID);
      const res = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o?ask=${encodeURIComponent(ask)}&uid=${event.senderID}&webSearch=off&apikey=9092efe8-8724-4e3d-87d9-dd7024df431d`);
      const reply = res.data.response;
      await api.editMessage(reply, thinking.messageID);
    } catch (err) {
      const thinking = await api.sendMessage("Thinking...", event.threadID);
      await api.editMessage("❌ An error occurred while fetching the response.", thinking.messageID);
    }
  }
};