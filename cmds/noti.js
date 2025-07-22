const fs = require('fs');
const path = require('path');

module.exports = {
  name: "noti",
  info: "Send a broadcast notification to all groups",
  dev: "Jonell Magallanes",
  onPrefix: true,
  usedby: 3,
  dmUser: false,
  usages: "[your message]",
  cooldowns: 5,

  onLaunch: async function ({ api, event, target, actions }) {
    const content = target.join(" ");
    if (!content) return actions.reply("Please provide a message to broadcast.");

    const loading = await actions.reply("🔄 Sending to the group threads...");

    try {
      const senderInfo = await global.getUser(event.senderID);
      const senderName = senderInfo.name || "Zach";

      const threads = await api.getThreadList(20, null, ['INBOX']);
      const groupThreads = threads.filter(thread => thread.isGroup);
      const threadIDs = groupThreads.map(thread => thread.threadID);

      // Optional image attachment from a fixed path
      const imagePath = path.join(__dirname, '../assets/noti.gif'); // You can change the image here
      const hasImage = fs.existsSync(imagePath);
      const imageStream = hasImage ? fs.createReadStream(imagePath) : null;

      const messageData = {
        body: `👤 𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻\n━━━━━━━━━━━━━━━━━━\n${content}\n\nDeveloper: ${senderName}`,
        attachment: hasImage ? imageStream : undefined
      };

      const results = await Promise.all(
        threadIDs.map(threadID => {
          return new Promise(resolve => {
            api.sendMessage(messageData, threadID, err => resolve(!err));
          });
        })
      );

      const successCount = results.filter(success => success).length;

      await actions.edit(
        `📝 𝗦𝗲𝗻𝗱𝗶𝗻𝗴 𝗧𝗵𝗿𝗲𝗮𝗱𝘀 𝗥𝗲𝘀𝘂𝗹𝘁\n━━━━━━━━━━━━━━━━━━\nNotification sent to ${successCount} out of ${threadIDs.length} threads.`,
        loading.messageID
      );

    } catch (err) {
      console.error(err);
      actions.edit("❌ Failed to send notifications due to an error.", loading.messageID);
    }
  }
};