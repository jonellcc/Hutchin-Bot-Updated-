const axios = require('axios');
const fs = require('fs');

module.exports = {
    name: "sadcat",
    info: "Generate sadcat meme with your text",
    dev: "CC",
    onPrefix: true,
    dmUser: true,
    nickName: ["sadcatmeme"],
    usages: "[text]",
    cooldowns: 5,

    onLaunch: async function ({ event, actions, target }) {
        if (!target[0]) return actions.reply("Please add text after /sadcat");

        try {
            const text = encodeURIComponent(target.join(" "));
            const apiUrl = `https://api.popcat.xyz/sadcat?text=${text}`;

            const response = await axios.get(apiUrl, { 
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            const tempFile = `./sadcat_${event.senderID}.png`;
            fs.writeFileSync(tempFile, response.data);

            await actions.send({
                attachment: fs.createReadStream(tempFile)
            });

            fs.unlinkSync(tempFile);

        } catch (error) {
            console.error(error);
            actions.reply("Failed to generate sadcat image");
        }
    }
};