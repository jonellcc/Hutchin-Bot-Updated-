const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const GRAPH_API_BASE = "https://graph.facebook.com";
const FB_HARDCODED_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
const LOVE_API_URL = "https://nexalo-api.vercel.app/api/lovev1";

function getProfilePictureURL(userID, size = [512, 512]) {
	const [height, width] = size;
	return `${GRAPH_API_BASE}/${userID}/picture?width=${width}&height=${height}&access_token=${FB_HARDCODED_TOKEN}`;
}

module.exports = {
	name: "love",
	info: "Create a cute love image with you and someone special 💖",
	dev: "zzach",
	onPrefix: true,
	dmUser: false,
	nickName: [],
	usages: "/love @user",
	cooldowns: 5,

	onLaunch: async function ({ api, event, actions }) {
		const { senderID, messageID, mentions, threadID } = event;
		const mentionIDs = Object.keys(mentions);

		if (mentionIDs.length === 0) {
			actions.react("❌");
			return actions.reply("💡 Please mention someone to create a love image.");
		}

		const targetID = mentionIDs[0];
		const targetName = mentions[targetID].replace('@', '').trim();

		if (targetID === senderID) {
			actions.react("❌");
			return actions.reply("🥺 You can't create a love image with yourself.");
		}

		const senderPic = getProfilePictureURL(senderID);
		const targetPic = getProfilePictureURL(targetID);

		try {
			const response = await axios.get(LOVE_API_URL, {
				params: {
					image1: senderPic,
					image2: targetPic
				},
				responseType: "arraybuffer",
				timeout: 10000
			});

			const contentType = response.headers["content-type"];
			if (!contentType?.startsWith("image/")) {
				throw new Error("API did not return an image.");
			}

			const cacheDir = path.join(__dirname, "cache");
			if (!fs.existsSync(cacheDir)) {
				fs.mkdirSync(cacheDir, { recursive: true });
			}

			const fileName = `love_${crypto.randomBytes(6).toString("hex")}.jpg`;
			const filePath = path.join(cacheDir, fileName);
			fs.writeFileSync(filePath, response.data);

			await actions.send({
				body: `❤️ Here's your love image with @${targetName}`,
				attachment: fs.createReadStream(filePath),
				mentions: [
					{
						tag: `@${targetName}`,
						id: targetID
					}
				]
			});

			fs.unlinkSync(filePath);
			actions.react("❤️");
			console.log(`[LOVE] Sent love image for ${senderID} and ${targetID}`);
		} catch (err) {
			console.error("[LOVE ERROR]", err.message);
			actions.react("❌");
			actions.reply(`⚠️ Failed to generate love image: ${err.message}`);
		}
	}
};