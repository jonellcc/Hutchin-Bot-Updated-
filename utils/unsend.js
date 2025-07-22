const fs = require("fs");
const axios = require("axios");
const path = require("path");

const handleUnsend = async (api, event, msgData, getUserName) => {
    const messageID = event.messageID;
    if (!msgData.hasOwnProperty(messageID)) return;

    const msgInfo = msgData[messageID];
    const senderID = event.senderID;
    const usernameh = await global.getUser(senderID);
    const username = usernameh.name || 'Facebook User';
    const attachments = msgInfo.attachments || [];
    const unsentText = msgInfo.body || '';
    const tempFiles = [];

    if (attachments.length > 0) {
        const streams = [];

        for (const item of attachments) {
            try {
                const { url, type } = item;
                const extMap = {
                    photo: '.jpg',
                    video: '.mp4',
                    audio: '.mp3',
                    animated_image: '.gif',
                    sticker: '.gif',
                    file: '.bin'
                };
                const extension = extMap[type] || '.bin';
                const filename = `${Date.now()}-${Math.floor(Math.random() * 9999)}${extension}`;
                const filePath = path.join(__dirname, "cache", filename);

                const { data } = await axios.get(url, { responseType: "arraybuffer" });
                fs.writeFileSync(filePath, Buffer.from(data));
                streams.push(fs.createReadStream(filePath));
                tempFiles.push(filePath);
            } catch (err) {
                console.error("Error downloading attachment:", err);
            }
        }

        const bodyText = unsentText
            ? `𝗨𝗻𝘀𝗲𝗻𝗱 𝗠𝗲𝘀𝘀𝗮𝗴𝗲\n━━━━━━━━━━━━━━━━━━\n${username} unsent this message:\n\nContent: ${unsentText}`
            : `${username} has unsent this attachment.`;

        api.sendMessage({
            body: bodyText,
            attachment: streams
        }, event.threadID, () => {
            for (const file of tempFiles) fs.unlinkSync(file);
        });

    } else {
        api.sendMessage(`𝗨𝗻𝘀𝗲𝗻𝗱 𝗠𝗲𝘀𝘀𝗮𝗴𝗲\n━━━━━━━━━━━━━━━━━━\n${username} has unsent this message\n\nContent: ${unsentText}`, event.threadID);
    }
};

module.exports = { handleUnsend };