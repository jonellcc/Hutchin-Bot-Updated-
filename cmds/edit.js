"use strict";

module.exports = {
  name: "editmsg",
  description: "Send and then edit a message.",
  onPrefix: true,

  async onLaunch({ api, event }) {
    try {
      const sent = await api.sendMessageMqtt(
        "Thinking...",
        event.threadID
      );

      // Wait a second to simulate edit delay (optional)
      await new Promise(resolve => setTimeout(resolve, 1000));

      await api.editMessage("Hello, world!", sent.messageID, event.threadID);
    } catch (err) {
      console.error("Error in 'editmsg' command:", err);
      api.sendMessageMqtt(
        "❌ Failed to edit message.\n• Reason: " + (err.message || "Unknown error"),
        event.threadID
      );
    }
  }
};