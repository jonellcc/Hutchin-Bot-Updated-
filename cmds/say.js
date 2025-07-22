const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

module.exports = {
		name: "say",
		info: "Convert text to speech",
		dev: "Mirai Team",
		onPrefix: true,
		dmUser: true,
		nickName: ["speak", "tts"],
		usages: "/say [tl/ru/en/ko/ja] [text]",
		cooldowns: 5,

		onLaunch: async function ({ event, actions, target }) {
				try {
						const supportedLangs = ["tl", "ru", "en", "ko", "ja"];
						let lang = "tl";
						let text = target ? target.join(" ") : "";

						if (target && target.length > 0 && supportedLangs.includes(target[0].toLowerCase())) {
								lang = target[0].toLowerCase();
								text = target.slice(1).join(" ");
						}

						if (!text) return;

						const audioPath = path.join(__dirname, 'cache', `${event.threadID}_${event.senderID}.mp3`);
						await fs.ensureDir(path.join(__dirname, 'cache'));

						const response = await axios.get(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`, {
								responseType: 'arraybuffer'
						});

						await fs.writeFile(audioPath, response.data);
						await actions.send({ attachment: fs.createReadStream(audioPath) });
						fs.unlinkSync(audioPath);

				} catch (error) {
						console.error(error);
				}
		}
};