const axios = require('axios');
const fs = require('fs');

module.exports = {
    name: "ad",
    info: "Create advertisement-style profile picture",
    dev: "CC",
    onPrefix: true,
    dmUser: true,
    nickName: ["advert", "profilead"],
    usages: "[@mention]",
    cooldowns: 10,

    onLaunch: async function ({ event, actions }) {
        try {
            // Get target ID - use mentioned user if available, otherwise use sender
            const targetID = event.mentions && Object.keys(event.mentions).length > 0 
                ? Object.keys(event.mentions)[0] 
                : event.senderID;

            const imageUrl = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            const apiUrl = `https://api.popcat.xyz/ad?image=${encodeURIComponent(imageUrl)}`;

            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            const tempFile = `./ad_${targetID}_${Date.now()}.jpg`;

            fs.writeFileSync(tempFile, response.data);
            
            await actions.send({
                body: "the ads:",
                attachment: fs.createReadStream(tempFile)
            });
            
            fs.unlinkSync(tempFile);

        } catch (error) {
            console.error(error);
            actions.reply("Failed to generate advertisement image");
        }
    }
};