"use strict";

module.exports = {
    name: "unsend",
    description: "Unsends a message sent by the bot when you reply to it.",
    onPrefix: true,

    async onLaunch({ api, event }) {
        try {
            const botID = api.getCurrentUserID();

            if (!event.messageReply) {
                return api.sendMessageMqtt(
                    "⚠️ Please reply to a message I sent to unsend it.",
                    event.threadID,
                    event.messageID
                );
            }

            const msg = event.messageReply;

            console.log("BotID:", botID);
            console.log("Message sender ID:", msg.senderID);
            console.log("Targeting messageID:", msg.messageID);
            console.log("In threadID:", event.threadID);

            if (msg.senderID !== botID) {
                return api.sendMessageMqtt(
                    "⚠️ I can only unsend my own messages.",
                    event.threadID,
                    event.messageID
                );
            }

            const result = await api.unsent(msg.messageID, event.threadID);
            console.log("Unsend result:", result);

            return api.setMessageReactionMqtt("👌", event.messageID, event.threadID);

        } catch (err) {
            console.error("❌ Error in 'unsend' command:", err);
            return api.sendMessageMqtt(
                `❌ Failed to unsend message.\n• Reason: ${err.message || "Unknown error"}`,
                event.threadID,
                event.messageID
            );
        }
    }
};