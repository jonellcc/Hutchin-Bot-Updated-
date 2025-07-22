const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GRAPH_API_BASE = 'https://graph.facebook.com';
const FB_HARDCODED_TOKEN = '6628568379|c1e620fa708a1d5696fb991c1bde5662';
const FBCOVER_API_URL = 'https://nexalo-api.vercel.app/api/fb-cover';

function getProfilePictureURL(userID, size = [512, 512]) {
	const [height, width] = size;
	return `${GRAPH_API_BASE}/${userID}/picture?width=${width}&height=${height}&access_token=${FB_HARDCODED_TOKEN}`;
}

module.exports = {
	name: "fbcover",
	info: "Generate a Facebook cover image with your profile picture and custom text",
	dev: "ZACH",
	onPrefix: true,
	dmUser: false,
	nickName: ["fbcover1", "cover"],
	usages: "/fbcover [text1 text2]",
	cooldowns: 5,

	onLaunch: async function ({ api, event, actions, target }) {
		if (target.length < 2) {
			return actions.reply("❌ Please provide two pieces of text. Example: /fbcover Hello World");
		}

		const [text1, ...rest] = target;
		const text2 = rest.join(" ");
		const senderID = event.senderID;

		try {
			console.log(`[FBCOVER] Generating cover for: ${text1} ${text2}`);

			const profilePicUrl = getProfilePictureURL(senderID);
			const apiUrl = `${FBCOVER_API_URL}?firstName=${encodeURIComponent(text1)}&lastName=${encodeURIComponent(text2)}&imageUrl=${encodeURIComponent(profilePicUrl)}`;

			const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 10000 });

			const contentType = response.headers['content-type'];
			if (!contentType || !contentType.startsWith('image/')) {
				throw new Error("API response is not an image.");
			}

			const cacheDir = path.join(__dirname, 'cache');
			if (!fs.existsSync(cacheDir)) {
				fs.mkdirSync(cacheDir, { recursive: true });
			}

			const filePath = path.join(cacheDir, `fbcover_${Date.now()}.png`);
			fs.writeFileSync(filePath, response.data);

			await actions.send({
				body: `✅ Facebook cover generated for "${text1} ${text2}"`,
				attachment: fs.createReadStream(filePath)
			});

			fs.unlinkSync(filePath);
			console.log(`[FBCOVER] Successfully sent cover for: ${text1} ${text2}`);

		} catch (error) {
			console.error('[FBCOVER ERROR]', error.message);
			actions.reply(`❌ Failed to generate Facebook cover: ${error.message}`);
		}
	}
};