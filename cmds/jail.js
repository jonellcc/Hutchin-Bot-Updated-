const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "jail",
    info: "Put someone's profile picture into a jail frame.",
    dev: "zach",
    onPrefix: true,
    dmUser: true,
    nickName: ["jailpic", "jail"],
    usages: "[@mention]",
    cooldowns: 10,

    onLaunch: async function ({ event, actions, api }) {
        try {
            const targetID = event.mentions && Object.keys(event.mentions).length > 0 
                ? Object.keys(event.mentions)[0] 
                : event.senderID;

            const imageUrl = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            const apiUrl = `https://api.popcat.xyz/v2/jail?image=${encodeURIComponent(imageUrl)}`;

            // Send a loading message first
            const loadingMessage = await actions.reply("🔄 Processing the jail image...");

            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            const tempFile = path.join(__dirname, 'cache', `jail_${targetID}_${Date.now()}.jpg`);

            fs.writeFileSync(tempFile, response.data);

            // Send the final image as an attachment
            await actions.send({
                body: "Here's your jail image!",
                attachment: fs.createReadStream(tempFile)
            });

            // Optionally, unsend the loading message after sending the result
            if (loadingMessage && loadingMessage.messageID) {
                await api.unsendMessage(loadingMessage.messageID); // Or actions.deleteMessage
            }

            // Clean up the temp file after sending
            fs.unlinkSync(tempFile);

        } catch (error) {
            console.error("Error in jail command:", error);
            actions.reply("❌ Failed to generate the jail image.");
        }
    }
};