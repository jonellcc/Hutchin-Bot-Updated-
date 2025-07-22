const fs = require('fs');
const path = require('path');

module.exports = {
    name: "topmoney",
    info: "Show wealth leaderboard",
    dev: "Jonell Magallanes",
    onPrefix: true,
    dmUser: true,
    nickName: ["richlist", "leaderboard"],
    usages: "",
    cooldowns: 5,
    category: "economy",
    onLaunch: async function ({ api, event, actions }) {
        const loading = await actions.reply("🔄 Loading wealth data...");
        const dbPath = path.join(__dirname, '../database/currencies.json');

        try {
            if (!fs.existsSync(dbPath)) {
                await api.unsendMessage(loading.messageID);
                return actions.edit("💰 𝗟𝗘𝗔𝗗𝗘𝗥𝗕𝗢𝗔𝗥𝗗\n━━━━━━━━━━━━━━\nNo economic data available yet!", loading.messageID);
            }

            const currencies = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            const users = Object.entries(currencies);

            if (users.length === 0) {
                await api.unsendMessage(loading.messageID);
                return actions.edit("💰 𝗟𝗘𝗔𝗗𝗘𝗥𝗕𝗢𝗔𝗥𝗗\n━━━━━━━━━━━━━━\nNo users have money yet!", loading.messageID);
            }

            const sortedUsers = users.sort((a, b) => {
                const totalA = (a[1].dollars || 0) + (a[1].xp || 0);
                const totalB = (b[1].dollars || 0) + (b[1].xp || 0);
                return totalB - totalA;
            }).slice(0, 10);

            let leaderboard = "💰 𝗧𝗢𝗣 𝗠𝗢𝗡𝗘𝗬 𝗟𝗘𝗔𝗗𝗘𝗥𝗕𝗢𝗔𝗥𝗗\n━━━━━━━━━━━━━━\n";
            const nameFetchPromises = [];
            
            for (const [userId] of sortedUsers) {
                nameFetchPromises.push(
                    global.getUser(userId).catch(() => ({ name: "Unknown User" }))
                );
            }

            const userNames = await Promise.all(nameFetchPromises);

            for (const [index, [userId, data]] of sortedUsers.entries()) {
                const name = userNames[index]?.name || "Unknown User";
                const dollars = data.dollars || 0;
                const xp = data.xp || 0;
                
                leaderboard += `🏆 ${index + 1}. ${name}\n`;
                leaderboard += `   💵 $${dollars} | ⚡ ${xp} XP\n`;
                leaderboard += `   📊 Total: $${dollars + xp}\n\n`;
            }

         
            leaderboard += `━━━━━━━━━━━━━━\nℹ️ Showing top ${sortedUsers.length} richest users`;
            actions.edit(leaderboard, loading.messageID);

        } catch (error) {
            console.error(error);
            if (loading) await api.unsendMessage(loading.messageID);
            actions.edit("❌ Failed to generate leaderboard. Please try again later.", loading.messageID);
        }
    }
};