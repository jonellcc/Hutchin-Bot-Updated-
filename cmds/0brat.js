const axios = require('axios');

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
			const text = encodeURIComponent(target.join(" "));
			const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/brat?text=${text}&type=stream`;

			const { data } = await axios.get(apiUrl, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
				}
			});

			if (!data?.brat) throw new Error("Invalid API response");

			const imageStream = await axios.get(data.brat, {
				responseType: 'stream'
			});

			const message = {
				body: `🖼️ Here's your brat image for: ${target.join(" ")}`,
				attachment: imageStream.data
			};

			await api.sendMessage(message, event.threadID, event.messageID);

		} catch (error) {
			console.error('[BRAT ERROR]', error);
			actions.reply("❌ Failed to generate brat image. Please try again later.");
		}
	}
};