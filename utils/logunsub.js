const handleLogUnsubscribe = async (api, event) => {
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  try {
    const { threadName, participantIDs } = await api.getThreadInfo(event.threadID);
    const type = (event.author == event.logMessageData.leftParticipantFbId)
      ? "left the group."
      : "kicked by Admin of the group";

    const userID = event.logMessageData.leftParticipantFbId;
    const username = global.getUser(userID);
 const name = username.name || 'Facebook User';
    api.shareContact(`${username} has been ${type}\nMember’s left: ${participantIDs.length}`, userID, event.threadID);
  } catch (err) {
    console.error("ERROR: ", err);
  }
};

module.exports = { handleLogUnsubscribe };