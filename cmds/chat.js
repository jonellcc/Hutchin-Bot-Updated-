const fs = require('fs');
const chatFilePath = './cache/chat.json';
let chat = {};

module.exports = {
	name: "chat",
	info: "Group chat control system",
	dev: "Jonell Magallanes",
	onPrefix: true,
	dmUser: false,
	nickName: ["chatcontrol"],
	usages: "[on/off]",
	cooldowns: 60,
	hasPermission: "Admin",

	onLoad: function () {
		if (fs.existsSync(chatFilePath)) {
			chat = JSON.parse(fs.readFileSync(chatFilePath));
		} else {
			fs.writeFileSync(chatFilePath, JSON.stringify({}));
		}
	},

	noPrefix: async function ({ api, event, actions }) {
		const threadID = String(event.threadID);
		if (!chat[threadID]) return;

		const botID = api.getCurrentUserID();
		if (event.senderID === botID) return;

		const threadInfo = await api.getThreadInfo(threadID);
		const isAdmin = threadInfo.adminIDs.some(admin => admin.id === event.senderID);
		const isBotAdmin = threadInfo.adminIDs.some(admin => admin.id === botID);

		if (!isAdmin && isBotAdmin) {
			const id = event.senderID;
			const getInfo = global.getUser(id);
			const username = getInfo.name || "Facebook User";
			await actions.kick(id);
			await actions.send(global.textFormat({
				Title: "**🔒 User Removed**",
				Description: `❌ **${username}** has been auto-removed due to chat restrictions.`,
				Footer: "🛡️ Chat Restriction System"
			}), threadID);
		}
	},

	onLaunch: async function ({ api, event, actions, target }) {
		const threadID = String(event.threadID);
		const threadInfo = await api.getThreadInfo(threadID);
		const isAdmin = threadInfo.adminIDs.some(admin => admin.id === event.senderID);

		if (!isAdmin) {
			return actions.reply(global.textFormat({
				Title: "**⛔ Access Denied**",
				Description: "Only group admins can manage chat restrictions.",
				Footer: "🔐 Chat Control"
			}));
		}

		const action = target[0]?.toLowerCase();
		if (action === 'off') {
			chat[threadID] = true;
			fs.writeFileSync(chatFilePath, JSON.stringify(chat));
			return actions.reply(global.textFormat({
				Title: "**🔒 Chat Restricted**",
				Description: "🛑 Non-admins will now be removed if they chat.",
				Footer: "📢 Use '/chat on' to disable"
			}));
		} else if (action === 'on') {
			chat[threadID] = false;
			fs.writeFileSync(chatFilePath, JSON.stringify(chat));
			return actions.reply(global.textFormat({
				Title: "**✅ Chat Unlocked**",
				Description: "💬 All members can now chat freely.",
				Footer: "📢 Use '/chat off' to restrict"
			}));
		} else {
			return actions.reply(global.textFormat({
				Title: "**❓ Usage**",
				Description: "📍 Use `/chat on` to allow chatting or `/chat off` to restrict.",
				Footer: "⚙️ Chat Control"
			}));
		}
	}
};