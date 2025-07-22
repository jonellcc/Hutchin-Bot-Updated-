const axios = require('axios');

module.exports = {
  name: "nglspam",
  info: "Send a spam message to a username on NGL",
  dev: "Zach",
  onPrefix: true,
  usages: "(username) (message) (amount)",
  role: 2,
  cooldowns: 5,

  onLaunch: async function ({ api, event, target, actions }) {
    try {
      if (target.length < 3) {
        return actions.reply('[ NGL ] Insufficient arguments. Usage: ?ngl [username] [message] [amount]');
      }

      const username = target.shift();
      const message = target.slice(0, -1).join(" ");
      const spamCount = parseInt(target[target.length - 1]);

      if (isNaN(spamCount) || spamCount <= 0) {
        return actions.reply('[ NGL ] Invalid amount. Please provide a valid positive number.');
      }

      let progressMessage = await api.sendMessage('[ NGL ] Starting the spam...', event.threadID);
      const progressMessageID = progressMessage.messageID;

      console.log(`[ NGL ] Spamming To: ${username}`);

      // Loop for spamming
      for (let i = 0; i < spamCount; i++) {
        const response = await axios.post('https://ngl.link/api/submit', {
          username: username,
          question: message,
          deviceId: '23d7346e-7d22-4256-80f3-dd4ce3fd8878',
          gameSlug: '',
          referrer: '',
        });

        if (response.status === 200 && response.data && response.data.success) {
          console.log(`[ NGL ] Message ${i + 1}: Success`);
        } else {
          console.log(`[ NGL ] Message ${i + 1}: Failed with response - ${response.status}`);
        }

        // Update loading progress
        const progress = Math.round(((i + 1) / spamCount) * 100);
        await api.editMessage(`[ NGL ] Spamming to ${username}... Progress: ${progress}% (${i + 1}/${spamCount})`, progressMessageID, event.threadID);
      }

      // Final message once all spamming is complete
      await api.editMessage(`[ NGL ] Successfully spammed ${spamCount} times to ${username}`, progressMessageID, event.threadID);
    } catch (error) {
      console.error('[ NGL ] Error:', error.message || error);
      return actions.reply('[ NGL ] Error: ' + error.message);
    }
  }
};
