const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  name: "fasttype",
  info: "Type the sentence as fast as you can!",
  dev: "Jonell Magallanes",
  onPrefix: true,
  dmUser: false,
  nickName: ["type", "typinggame"],
  usages: "",
  cooldowns: 5,
  category: "games",

  onLaunch: async function ({ api, event }) {
    try {
      const res = await axios.get("https://dummyjson.com/quotes/random", {
        headers: {
          "User-Agent": "Mozilla/5.1"
        }
      });

      const sentence = res.data.quote;
      const startTime = Date.now();
      const message = await api.sendMessage(
        `⌨️ 𝗙𝗔𝗦𝗧 𝗧𝗬𝗣𝗘 ⌨️\n━━━━━━━━━━━━━━\nType the following sentence as fast as you can:\n\n"${sentence}"\n\n(Reply to this message)`,
        event.threadID
      );

      if (!global.client.onReply) {
        global.client.onReply = [];
      }

      global.client.onReply.push({
        name: this.name,
        messageID: message.messageID,
        author: event.senderID,
        timestamp: Date.now(),
        sentence,
        startTime,
        completed: false
      });
    } catch {
      api.sendMessage("❌ Failed to load sentence. Try again later.", event.threadID);
    }
  },

  onReply: async function ({ api, event }) {
    const replyContext = global.client.onReply.find(
      r => r.author === event.senderID && r.name === this.name
    );
    if (!replyContext || replyContext.completed) return;

    const typed = event.body.trim();
    const correct = replyContext.sentence.trim();

    if (typed !== correct) {
      api.sendMessage("❌ Incorrect! Try again.", event.threadID);
      return;
    }

    replyContext.completed = true;
    const timeTaken = ((Date.now() - replyContext.startTime) / 1000).toFixed(2);
    const dbPath = path.join(__dirname, '../database/currencies.json');
    const currencies = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf8')) : {};

    if (!currencies[event.senderID]) {
      currencies[event.senderID] = { xp: 0, dollars: 0 };
    }

    const xpEarned = Math.max(10, 60 - Math.floor(timeTaken));
    currencies[event.senderID].xp += xpEarned;
    fs.writeFileSync(dbPath, JSON.stringify(currencies, null, 2));

    api.sendMessage(`🎉 Correct!\n⏱️ Time: ${timeTaken}s\n+${xpEarned} XP`, event.threadID);
    global.client.onReply = global.client.onReply.filter(
      r => !(r.author === event.senderID && r.name === this.name)
    );
  }
};