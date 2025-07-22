module.exports = {
  name: "getlink",
  usedby: 0,
  dev: "Mirai Team and CC PROJECT TEAM",
  info: "Get the download URL from replied media (audio, video, or image).",
  onPrefix: false,
  dmUser: false,
  usages: "getlink",
  cooldowns: 5,

  onLaunch: async ({ api, event }) => {
    const reply = event.messageReply;

    if (!reply || !reply.attachments || reply.attachments.length === 0) {
      return api.sendMessageMqtt("❌ No media found in the replied message.", event.threadID, event.messageID);
    }

    console.log("[DEBUG] Attachments from messageReply:\n", JSON.stringify(reply.attachments, null, 2));

    const urls = reply.attachments.map(att => {
      return att.url || att.largePreviewUrl || att.previewUrl || att.thumbnailUrl || null;
    }).filter(Boolean);

    if (urls.length === 0) {
      return api.sendMessageMqtt("❌ No usable URL found in the media.", event.threadID, event.messageID);
    }

    await api.sendMessageMqtt(urls.join("\n"), event.threadID, event.messageID);
    api.setMessageReactionMqtt("✅", event.messageID, event.threadID);
  }
};