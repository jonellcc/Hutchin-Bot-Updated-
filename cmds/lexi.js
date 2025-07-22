const axios = require('axios');
const fs = require('fs');

module.exports = {
		name: "lexi",
		info: "Generate Lexi-style images",
		dev: "CC",
		onPrefix: true,
		dmUser: true,
		nickName: ["lexitext"],
		usages: "/lexi [text]",
		cooldowns: 5,

		onLaunch: async function ({ event, actions, target }) {
				if (!target[0]) return actions.reply("Add text after /lexi");

				try {
						const text = encodeURIComponent(target.join(" "));
						const response = await axios.get(`https://jonell01-ccprojectsapihshs.hf.space/api/lexi?text=${text}&type=direct`, {
								responseType: 'arraybuffer'
						});

						const tempFile = `./lexi_${Date.now()}.png`;
						fs.writeFileSync(tempFile, response.data);

						await actions.send({
								attachment: fs.createReadStream(tempFile)
						});

						fs.unlinkSync(tempFile);
						

				} catch {
						
						actions.reply("Failed to generate image");
				}
		}
};