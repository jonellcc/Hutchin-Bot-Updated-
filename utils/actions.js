const actions = (api, event) => {
api.sendMessage = api.sendMessageMqtt;
  api.setMessageReaction = api.setMessageReactionMqtt;

  return {
    reply: async (form) => {
      return await api.sendMessage(form, event.threadID, event.messageID);
    },
    send: async (form) => {
      return await api.sendMessage(form, event.threadID);
    },
    react: async (emoji) => {
      return await api.setMessageReaction(emoji, event.messageID, () => {}, true);
    },
    kick: async (userID) => {
      return await api.removeUserFromGroup(userID, event.threadID, () => {});
    },
    leave: async () => {
      return await api.removeUserFromGroup(api.getCurrentUserID(), event.threadID, () => {});
    },
    edit: async (form, messageID) => {
      return await api.editMessage(form, messageID, event.threadID, event.messageID);
    }
  };
};

module.exports = { actions };