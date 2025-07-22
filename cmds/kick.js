module.exports = {
    name: "kick",
    info: "Remove the person you want to kick from the group by tagging them",
    dev: "Mirai Team",
    onPrefix: true,
    dmUser: false,
    nickName: [],
    usages: "[tag]",
    cooldowns: 0,
    hide: true,
    category: "other",
    onLaunch: async function ({ api, event, actions }) {
        const mention = Object.keys(event.mentions);
        
        const info = await api.getThreadInfo(event.threadID);
        
        if (!info.adminIDs.some(item => item.id == api.getCurrentUserID())) {
            return api.sendMessageMqtt('Need group admin rights\nPlease add and try again!', event.threadID, event.messageID);
        }
        
        if (!mention[0]) {
            return api.sendMessageMqtt("You must tag the person to kick", event.threadID, event.messageID);
        }
        
        if (info.adminIDs.some(item => item.id == event.senderID)) {
            for (const userID of mention) {
                setTimeout(async () => {
                    await actions.kick(userID);
                }, 3000);
            }
        }
    }
};