"use strict";

const utils = require('../../../utils');

module.exports = (defaultFuncs, api, ctx) => {
  /**
   * Unsends a message.
   * Made by ChoruOfficial 
   * Mqtt
   * @param {string} messageID The ID of the message to unsend.
   * @param {string} threadID The ID of the thread where the message is.
   * @param {Function} [callback] Optional callback function.
   * @returns {Promise<object>} A promise that resolves with information about the unsend action.
   */
  
   //Modified by Neth
   //iloveyou wiegine
   
  return async (messageID, threadID) => {
    
    if (!messageID) {
        return _callback(new Error("messageID is required."));
    }
    if (!threadID) {
         return _callback(new Error("threadID is required."));
    }
    if (!ctx.mqttClient) {
        return _callback(new Error("Not connected to MQTT"));
    }

    ctx.wsReqNumber = (ctx.wsReqNumber || 0) + 1;
    ctx.wsTaskNumber = (ctx.wsTaskNumber || 0) + 1;

    const queryPayload = {
      message_id: messageID,
      thread_key: parseInt(threadID),
      sync_group: 1
    };

    const query = {
      failure_count: null,
      label: "33", 
      payload: JSON.stringify(queryPayload),
      queue_name: "unsend_message",
      task_id: ctx.wsTaskNumber
    };
    const context = {
      app_id: ctx.appID,
      payload: {
        epoch_id: parseInt(utils.generateOfflineThreadingID()),
        tasks: [query],
        version_id: "24631415369801570"
      },
      request_id: ctx.wsReqNumber,
      type: 3
    };
    context.payload = JSON.stringify(context.payload);
    const data = await ctx.mqttClient.publish('/ls_req', JSON.stringify(context), { qos: 1, retain: false });
    return {
        ...(data && { ...data }),
        type: "unsend_message",
        threadID: threadID,
        messageID: messageID, 
        senderID: ctx.userID,
        BotID: ctx.userID,
        timestamp: Date.now(),
      };
  };
};