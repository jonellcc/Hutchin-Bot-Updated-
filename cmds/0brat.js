const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
	name: "brat",
	info: "Generate brat-style images via API",
	dev: "CC",
	onPrefix: true,
	dmUser: true,
	nickName: ["brattext"],
	usages: "/brat [text]",
	cooldowns: 5,

	onLaunch: async function ({ api, event, actions, target }) {
		if (!target[0]) return actions.reply("Please add text after /brat");

		try {
			console.log(`[BRAT] Starting process for text: ${target.join(" ")}`);
			const text = encodeURIComponent(target.join(" "));
			const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/brat?text=${text}&type=stream`;

			console.log(`[BRAT] Fetching image URL from API`);
			const { data } = await axios.get(apiUrl, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
				}
			});

			if (!data?.brat) throw new Error("Invalid API response");
			console.log(`[BRAT] Received image URL: ${data.brat}`);

			console.log(`[BRAT] Downloading image`);
			const imageResponse = await axios.get(data.brat, {
				responseType: 'arraybuffer'
			});

			const cacheDir = path.join(__dirname, 'cache');
			if (!fs.existsSync(cacheDir)) {
				console.log(`[BRAT] Creating cache directory`);
				fs.mkdirSync(cacheDir, { recursive: true });
			}

			const imagePath = path.join(cacheDir, `brat_${Date.now()}.png`);
			console.log(`[BRAT] Saving image to: ${imagePath}`);
			fs.writeFileSync(imagePath, imageResponse.data);

			console.log(`[BRAT] Sending image to user`);
			const message = {
				attachment: fs.createReadStream(imagePath)
			};

			await api.sendMessage(message, event.threadID, async () => {
				console.log(`[BRAT] Cleaning up temporary file`);
				fs.unlink(imagePath, (err) => {
					if (err) console.error(`[BRAT] Failed to delete image:`, err);
					else console.log(`[BRAT] File deleted successfully`);
				});
			}, event.messageID);

			console.log(`[BRAT] Process completed successfully`);

		} catch (error) {
			console.error('[BRAT ERROR]', error);
			actions.reply("Failed to generate brat image. Please try again later.");
		}
	}
};