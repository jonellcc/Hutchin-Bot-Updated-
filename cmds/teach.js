const axios = require('axios');

module.exports = {
    name: "teach",
    usedBy: 0,
    dev: "ZACH (jonell struc)", 
    dmUser: false,
    info: "Teach the bot custom responses",
    onPrefix: false,
    cooldowns: 0,

    onLaunch: async function ({ api, event, target }) {
        const input = target.join(" ");

        if (!input.includes("=>")) {
            return api.sendMessage(
                "⚠️ Invalid format! Use this format:\n\nteach <question> => <response>",
                event.threadID,
                event.messageID
            );
        }

        const [ask, response] = input.split("=>").map(part => part.trim());

        if (!ask || !response) {
            return api.sendMessage(
                "❌ Both question and response are required.",
                event.threadID,
                event.messageID
            );
        }

        try {
            const apiURL = `https://ccproject.serv00.net/other/sim/sim.php?ask=${encodeURIComponent(ask)}&response=${encodeURIComponent(response)}`;
            const res = await axios.get(apiURL, {
                headers: {
                    'User-Agent': 'Mozilla/5.1'
                }
            });
 
            if (res.status === 200) {
                const bold = global.fonts.bold("✅ Successfull Learned Sim");
                return api.sendMessage(
                    `${bold}\n${global.line}\nBot successfully learned:\n\n🟡 Question: ${ask}\n🟢 Answer: ${response}\n${global.line}`,
                    event.threadID,
                    event.messageID
                );
            } else {
                return api.sendMessage(
                    "⚠️ Teaching might have failed. The server didn't return a successful response.",
                    event.threadID,
                    event.messageID
                );
            }
        } catch (error) {
            console.error("[TEACH ERROR]", error);
            return api.sendMessage(
                "❌ Error occurred while sending data to the API.",
                event.threadID,
                event.messageID
            );
        }
    }
};