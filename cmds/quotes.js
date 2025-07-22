const axios = require("axios");

module.exports = {
    name: "quotes",
    usedBy: 0,
    dev: "ZACH (jonell struc)",
    dmUser: false,
    info: "Get a random inspirational quote",
    onPrefix: false,
    cooldowns: 3,

    onLaunch: async function ({ api, event }) {
        const footers = [
            "Keep pushing forward.",
            "Let this guide your day.",
            "A thought to carry with you.",
            "Small words, big meaning.",
            "Fuel for the soul.",
            "Pause. Reflect. Grow.",
            "Take this to heart."
        ];
        const randomFooter = footers[Math.floor(Math.random() * footers.length)];

        try {
            const res = await axios.get("https://dummyjson.com/quotes/random");
            const { quote, author } = res.data;

            const msg = global.textFormat({
                Title: "📜  𝗥𝗔𝗡𝗗𝗢𝗠 𝗤𝗨𝗢𝗧𝗘",
                Description: `“${quote}”\n\n— ${author}`,
                Footer: randomFooter
            });

            api.sendMessage(msg, event.threadID, event.messageID);
        } catch (err) {
            api.sendMessage("❌ Failed to fetch a quote. Please try again later.", event.threadID, event.messageID);
        }
    }
};