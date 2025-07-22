const handleLogSubscribe = (api, event, adminConfig) => {
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    api.changeNickname(`${adminConfig.botName} • [ ${adminConfig.prefix} ]`, event.threadID, api.getCurrentUserID());
    return api.shareContact(`✅ 𝗕𝗼𝘁 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱\n━━━━━━━━━━━━━━━━━━\n${adminConfig.botName} Bot connected successfully!\nType "${adminConfig.prefix}help" to view all commands\n\nContact: ${adminConfig.ownerName}`, api.getCurrentUserID(), event.threadID);
  } else {
    const { threadID } = event;
    api.getThreadInfo(threadID, (err, threadInfo) => {
      if (err) return console.error(err);
      const { threadName, participantIDs } = threadInfo;
      const tn = threadName || "Unnamed group";
      const addedParticipants = event.logMessageData.addedParticipants;

      for (const newParticipant of addedParticipants) {
        const userID = newParticipant.userFbId;
        const username = global.getUser(userID);
          const name = username.name || 'Facebook User';

        if (userID !== api.getCurrentUserID()) {
          api.shareContact(`Hello ${name}!\nWelcome to ${tn}\nYou're the ${participantIDs.length}th member on this group. Enjoy!`, userID, event.threadID);
        }
      }
    });
  }
};

module.exports = { handleLogSubscribe };