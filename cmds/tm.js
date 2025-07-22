const fs = require('fs');
const path = require('path');

function loadDB() {
    const dbPath = path.join(__dirname, '../database/currencies.json');
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
    }
    return {
        path: dbPath,
        data: JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    };
}

module.exports = {
    name: "transfermoney",
    info: "Transfer money/XP to other users",
    dev: "Jonell Magallanes",
    onPrefix: true,
    dmUser: false,
    nickName: ["transfer", "sendmoney", "moneytransfer"],
    usages: "<amount> <dollar/xp> @mention or UID",
    cooldowns: 10,
    category: "economy",
    onLaunch: async function ({ api, event, actions, target }) {
        try {
            const { senderID, mentions = {} } = event;
            const db = loadDB();
            const currencies = db.data;

            if (target.length < 3) {
                return actions.reply("❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗨𝗦𝗔𝗚𝗘\n━━━━━━━━━━━━━━\nUsage:\n- /transfermoney <amount> <dollar/xp> @user\n- /transfermoney <amount> <dollar/xp> <UID>");
            }

            const amount = parseFloat(target[0]);
            const currencyType = target[1].toLowerCase();
            const mentionIDs = Object.keys(mentions);
            const recipientInput = target[2];
            let recipientID;

            if (mentionIDs.length > 0) {
                recipientID = mentionIDs[0];
            } else if (/^\d+$/.test(recipientInput)) {
                recipientID = recipientInput;
            } else {
                return actions.reply("❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗥𝗘𝗖𝗜𝗣𝗜𝗘𝗡𝗧\n━━━━━━━━━━━━━━\nMust mention user or provide valid UID");
            }

            if (isNaN(amount) || amount <= 0) {
                return actions.reply("❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗔𝗠𝗢𝗨𝗡𝗧\n━━━━━━━━━━━━━━\nAmount must be a positive number");
            }

            if (currencyType !== 'dollar' && currencyType !== 'xp') {
                return actions.reply("❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗖𝗨𝗥𝗥𝗘𝗡𝗖𝗬\n━━━━━━━━━━━━━━\nPlease specify 'dollar' or 'xp'");
            }

            if (senderID === recipientID) {
                return actions.reply("❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗧𝗥𝗔𝗡𝗦𝗙𝗘𝗥\n━━━━━━━━━━━━━━\nYou cannot transfer to yourself");
            }

            if (!currencies[senderID]) currencies[senderID] = { dollars: 0, xp: 0 };
            if (!currencies[recipientID]) currencies[recipientID] = { dollars: 0, xp: 0 };

            const key = currencyType + 's'; // dollars or xp
            const senderBalance = currencies[senderID][key] || 0;

            if (senderBalance < amount) {
                return actions.reply(`❌ 𝗜𝗡𝗦𝗨𝗙𝗙𝗜𝗖𝗜𝗘𝗡𝗧 𝗙𝗨𝗡𝗗𝗦\n━━━━━━━━━━━━━━\nYou only have ${senderBalance} ${key}`);
            }

            currencies[senderID][key] -= amount;
            currencies[recipientID][key] += amount;
            fs.writeFileSync(db.path, JSON.stringify(currencies, null, 2));

            let recipientName;
            if (mentionIDs.length > 0) {
                recipientName = mentions[recipientID].replace("@", "").trim();
            } else {
                try {
                    const userInfo = await global.getUser(recipientID);
                    recipientName = userInfo.name || event.senderID;
                } catch {
                    recipientName = "Unknown User";
                }
            }

            actions.reply(
                `✅ 𝗧𝗥𝗔𝗡𝗦𝗙𝗘𝗥 𝗦𝗨𝗖𝗖𝗘𝗦𝗦\n━━━━━━━━━━━━━━\n` +
                `You sent ${amount} ${key} to ${recipientName}\n\n` +
                `Your new balance:\n` +
                `💵 Dollars: ${currencies[senderID].dollars}\n` +
                `⚡ XP: ${currencies[senderID].xp}`
            );

        } catch (err) {
            console.error("TransferMoney Error:", err);
            actions.reply(`❌ 𝗘𝗥𝗥𝗢𝗥\n━━━━━━━━━━━━━━\n${err.message || "Transfer failed. Please try again."}`);
        }
    }
};