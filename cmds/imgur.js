const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "imgur",
  info: "Upload an image and return the hosted link",
  dev: "CC",
  onPrefix: true,
  dmUser: true,
  usages: "(reply to an image)",
  cooldowns: 5,

  onLaunch: async function ({ event, actions }) {
    try {
      const reply = event.messageReply;
      if (!reply || !reply.attachments || reply.attachments.length === 0) {
        return actions.reply("❌ Please reply to an image to upload.");
      }

      const attachment = reply.attachments[0];
      if (attachment.type !== "photo") {
        return actions.reply("❌ Only image attachments are supported.");
      }

      const imageUrl = attachment.url;
      const encodedURL = encodeURIComponent(imageUrl);
      const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/upload?image=${encodedURL}`;

      const { data } = await axios.get(apiUrl);

      if (data && data.success && data.link) {
        return actions.reply(`✅ Uploaded successfully:\n${data.link}`);
      } else {
        return actions.reply("❌ Failed to upload. No link returned.");
      }

    } catch (err) {
      console.error("Upload Error:", err.message || err);
      return actions.reply("❌ Something went wrong while uploading the image.");
    }
  }
};