module.exports = {
    name: "getname",
    usedby: 0,
    info: "Fetches the name of the user who triggered the command",
    onPrefix: true,
    cooldowns: 10,

    onLaunch: async function ({ event, api, target }) {
        try {
            const senderID = event.senderID;
            
            // Use global.getUser to fetch profile info
            const profileInfo = await global.getUser(senderID);
            
            // Check if name exists
            if (!profileInfo || !profileInfo.name) {
                return api.sendMessage("❌ Could not retrieve name information.", event.threadID, event.messageID);
            }
            
            // Send just the name
            api.sendMessage(`👤 Your name: ${profileInfo.name}`, event.threadID, event.messageID);
            
        } catch (error) {
            console.error("GetName command error:", error);
            api.sendMessage("❌ Failed to fetch name information. Please try again later.", event.threadID, event.messageID);
        }
    }
};