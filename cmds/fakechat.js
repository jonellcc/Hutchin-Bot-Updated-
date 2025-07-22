const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const GRAPH_API_BASE = 'https://graph.facebook.com';
const FB_HARDCODED_TOKEN = '6628568379|c1e620fa708a1d5696fb991c1bde5662';
const FAKECHAT_API_URL = "https://nexalo-api.vercel.app/api/fake-chat-v2";

function getProfilePictureURL(userID, size = [512, 512]) {
	const [height, width] = size;
	return `${GRAPH_API_BASE}/${userID}/picture?width=${width}&height=${height}&access_token=${FB_HARDCODED_TOKEN}`;
}

module.exports = {
	name: "fakechat",
	info: "Generate a fake chat image using your or someone else's profile picture and custom text",
	dev: "zach",
	onPrefix: true,
	dmUser: false,
	nickName: ["fakechat", "fakechatv2"],
	usages: "/fakechat2 [text] or /fakechat2 @user [text]",
	cooldowns: 5,

	onLaunch: async function ({ api, event, actions, target }) {
		const { senderID, mentions } = event;

		if (!target.length) {
			return actions.reply("⚠️ Please provide some text for the fake chat.\nExample: `/fakechat2 Hello there!` or `/fakechat2 @user Hello!`");
		}

		let targetID = senderID;
		let targetName = null;
		const mentionIDs = Object.keys(mentions);

		if (mentionIDs.length > 0) {
			targetID = mentionIDs[0];
			targetName = mentions[targetID].replace('@', '').trim();
			target = target.slice(1);
		}

		const chatText = target.join(" ").trim();
		if (!chatText) {
			return actions.reply("⚠️ Please provide some text after the mention.\nExample: `/fakechat2 @user Hello!`");
		}

		// Use Graph API to get the profile picture
		const profilePicUrl = getProfilePictureURL(targetID);

		const apiUrl = `${FAKECHAT_API_URL}?imageUrl=${encodeURIComponent(profilePicUrl)}&text=${encodeURIComponent(chatText)}`;

		try {
			console.log(`[FAKECHAT2] Generating fake chat for ${targetID} with text: "${chatText}"`);
			const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 15000 });

			const contentType = response.headers["content-type"];
			if (!contentType || !contentType.startsWith("image/")) {
				throw new Error("API did not return an image.");
			}

			const cacheDir = path.join(__dirname, "cache");
			if (!fs.existsSync(cacheDir)) {
				fs.mkdirSync(cacheDir, { recursive: true });
			}

			const fileExt = contentType.includes("png") ? ".png" : ".jpg";
			const filePath = path.join(cacheDir, `fakechat_${crypto.randomBytes(6).toString("hex")}${fileExt}`);
			fs.writeFileSync(filePath, response.data);

			const msg = {
				body: `💬 Here's your fake chat image!`,
				attachment: fs.createReadStream(filePath)
			};

			if (targetID !== senderID) {
				msg.mentions = [{
					tag: `@${targetName || "User"}`,
					id: targetID
				}];
			}

			await actions.send(msg);
			fs.unlinkSync(filePath);
			console.log(`[FAKECHAT2] Sent fake chat image for ${targetID}`);
		} catch (err) {
			console.error("[FAKECHAT2 ERROR]", err.message);
			actions.reply(`❌ Failed to generate fake chat image: ${err.message}`);
		}
	}
};