const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/currencies.json');

function loadDB() {
	if (!fs.existsSync(dbPath)) {
		fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
	}
	try {
		const data = fs.readFileSync(dbPath, 'utf-8');
		return JSON.parse(data);
	} catch (err) {
		console.error("[BALANCE] Error loading DB:", err);
		return {};
	}
}

function saveDB(data) {
	try {
		fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
	} catch (err) {
		console.error("[BALANCE] Error saving DB:", err);
	}
}

function boldNumber(text) {
	const map = { "0": "𝟬", "1": "𝟭", "2": "𝟮", "3": "𝟯", "4": "𝟰", "5": "𝟱", "6": "𝟲", "7": "𝟳", "8": "𝟴", "9": "𝟵" };
	return text.toString().split('').map(c => map[c] || c).join('');
}

module.exports = {
	name: "balance",
	info: "View your balance or someone else's if tagged",
	dev: "Rishad (converted by zach)",
	onPrefix: true,
	dmUser: false,
	nickName: ["money"],
	usages: "/balance or /balance @user",
	cooldowns: 5,
	category: "economy",

	onLaunch: async function ({ api, event, actions }) {
		try {
			const { senderID, mentions } = event;
			const db = loadDB();
			const mentionIDs = Object.keys(mentions);
			const isTagging = mentionIDs.length > 0;

			const loading = await actions.reply("⏳ Loading balance...");

			let message = "💰 𝗕𝗔𝗟𝗔𝗡𝗖𝗘\n━━━━━━━━━━━━━━━\n";

			if (isTagging) {
				for (const uid of mentionIDs) {
					if (!db[uid]) db[uid] = { dollars: 0, xp: 0, lastDaily: 0 };
					const name = mentions[uid].replace("@", "").trim();
					message += `${name} has ${boldNumber(db[uid].dollars)}$\n`;
				}
			} else {
				if (!db[senderID]) db[senderID] = { dollars: 0, xp: 0, lastDaily: 0 };
				message += `You have ${boldNumber(db[senderID].dollars)}$\n`;
			}

			message += "━━━━━━━━━━━━━━━";

			await api.editMessage(message, loading.messageID);
		} catch (err) {
			console.error("Error executing command balance:", err);
			await actions.reply(`❌ An error occurred: ${err.message || err}`);
		}
	}
};