//CC PROJECT JONELL MAGALLANES 🥲 DONT STEAL THE CODE WITHOUT CREDIT
const fs = require("fs");
const axios = require('axios');
const gradient = require('gradient-string');
const { bannedUsers, bannedThreads } = require('./ban');
const { handleUnsend } = require('./unsend');
const { handleLogSubscribe } = require('./logsub');
const { handleLogUnsubscribe } = require('./logunsub');
const { actions } = require('./actions');
const { logChatRecord, notifyAdmins } = require('./logs');
const { handleAdminChange } = require('./groupProtection');

const threadsDB = JSON.parse(fs.readFileSync("./database/threads.json", "utf8") || "{}");
const usersDB = JSON.parse(fs.readFileSync("./database/users.json", "utf8") || "{}");
const cooldowns = {};
global.client = global.client || { callReact: [], onReply: [] };
global.bot = { usersDB, threadsDB };
global.line = "━━━━━━━━━━━━━━━━━━";

const adminConfigPath = "./admin.json";
let adminConfig = {};
global.cc = adminConfig;

try {
    adminConfig = JSON.parse(fs.readFileSync(adminConfigPath, "utf8"));
} catch (err) {
    console.error(err);
}

const handleListenEvents = (api, commands, eventCommands, threadsDB, usersDB) => {
api.setOptions({ listenEvents: true, api })
/*api.sendMessage = api.sendMessageMqtt
api.setMessageReaction = api.setMessageReactionMqtt;*/
    api.listenMqtt(async (err, event) => {
      if ((!event.body && !event.messageReply) || (event.type !== "message" && event.type !== "message_reply")) return;
        if (err) return console.error(gradient.passion(err));
if (event.type === "message_reaction") {
  api.setMessageReactionMqtt(event.reaction, event.messageID, () => null, true);
}
/*api.sendMessage = api.sendMessageMqtt
api.setMessageReaction = api.setMessageReactionMqtt;*/
        async function getUserName(api, senderID) {
            try {                const userInfo = await global.getUser(senderID);
                return userInfo.name || "User";
            } catch (error) {
                console.error(error);
                return "User";
            }
        }

        if (event.logMessageType === "log:subscribe") {
            await notifyAdmins(api, event.threadID, "Joined", event.senderID);
            handleLogSubscribe(api, event, adminConfig);
        }

        if (event.logMessageType === "log:unsubscribe") {
            await notifyAdmins(api, event.threadID, "Kicked", event.senderID);
            await handleLogUnsubscribe(api, event);
        }
/*if (event.logMessageType === "log:thread-admins") {

    await handleAdminChange(api, event);

}*/
   if (event.logMessageType === "log:thread-admins") {
    await handleAdminChange(api, event);
}
if (event.logMessageType === "log:thread-name") {
    await handleAdminChange(api, event);
}
if (event.logMessageType === "log:thread-image") {
    await handleAdminChange(api, event);
}     
        let msgData = {};
        try {
            msgData = JSON.parse(fs.readFileSync('./database/message.json'));
        } catch (err) {
            console.error(err);
        }

        const senderID = event.senderID;
        const threadID = event.threadID;
        const isGroup = threadID !== senderID;

        if (bannedThreads[threadID]) {
            return api.sendMessage(`𝗧𝗵𝗿𝗲𝗮𝗱 𝗕𝗮𝗻𝗻𝗲𝗱\n━━━━━━━━━━━━━━━━━━\nThis thread has been banned for some violation. Reason: ${bannedThreads[threadID].reason}.`, threadID, () => {
                api.removeUserFromGroup(api.getCurrentUserID(), threadID);
            });
        }

        if (event.type === "message") {
            const messageID = event.messageID;
            msgData[messageID] = { body: event.body, attachments: event.attachments || [] };
            try {
                fs.writeFileSync('./database/message.json', JSON.stringify(msgData, null, 2));
            } catch (err) {
                console.error(err);
            }
            await logChatRecord(api, event, usersDB);
        }

        if (event.type === "message_unsend" && adminConfig.resend === true) {
            await handleUnsend(api, event, msgData, getUserName);
        }

        const cmdActions = actions(api, event);

        if (event.type === 'message' || event.type === 'message_reply') {
            const senderID = event.senderID;
            const threadID = event.threadID;
            const message = event.body.trim();
         /*   const isPrefixed = message.startsWith(adminConfig.prefix);
            const commandName = (isPrefixed ? message.slice(adminConfig.prefix.length).split(' ')[0] : message.split(' ')[0]).toLowerCase();
            const commandArgs = isPrefixed ? message.slice(adminConfig.prefix.length).split(' ').slice(1) : message.split(' ').slice(1);
*/


const isPrefixed = message.startsWith(adminConfig.prefix);

if (isPrefixed) {
  if (fs.existsSync('./utils/mt/mt.txt')) {
    const mt = fs.readFileSync('./utils/mt/mt.txt', 'utf8').trim().toLowerCase();
    if (mt === 'on') {
      let reason = 'No reason provided';
      if (fs.existsSync('./utils/mt/mtreason.txt')) {
        reason = fs.readFileSync('./utils/mt/mtreason.txt', 'utf8').trim();
      }
      return api.sendMessage(`🧑‍🔧 𝗠𝗮𝗶𝗻𝘁𝗲𝗻𝗮𝗻𝗰𝗲 𝗠𝗼𝗱𝗲 \n━━━━━━━━━━━━━━━━━━\nMaintenance mode\n\n📝 Reason: ${reason}`, event.threadID, event.messageID);
    }
  }
}

const commandName = (isPrefixed ? message.slice(adminConfig.prefix.length).split(' ')[0] : message.split(' ')[0]).toLowerCase();
const commandArgs = isPrefixed ? message.slice(adminConfig.prefix.length).split(' ').slice(1) : message.split(' ').slice(1);  
       
           /* if (!usersDB[senderID]) {
                usersDB[senderID] = { lastMessage: Date.now() };
                fs.writeFileSync("./database/users.json", JSON.stringify(usersDB, null, 2));
                console.error(gradient.summer(`[ DATABASE ] NEW DETECT USER IN SENDER ID: ${senderID}`));
            }

            if (!threadsDB[threadID]) {
                threadsDB[threadID] = { lastMessage: Date.now() };
                fs.writeFileSync("./database/threads.json", JSON.stringify(threadsDB, null, 2));
                if (isGroup) {
                    console.error(gradient.summer(`[ DATABASE ] NEW DETECTED THREAD ID: ${threadID}`));
                }
            }
*/


if (adminConfigPath.database) {
    if (!usersDB[senderID]) {
        usersDB[senderID] = { lastMessage: Date.now() };
    console.log("DATABASE SETTING:", adminConfig.database);   fs.writeFileSync("./database/users.json", JSON.stringify(usersDB, null, 2));
        console.error(gradient.summer(`[ DATABASE ] NEW DETECT USER IN SENDER ID: ${senderID}`));
    }

    if (!threadsDB[threadID]) {
        threadsDB[threadID] = { lastMessage: Date.now() };
        fs.writeFileSync("./database/threads.json", JSON.stringify(threadsDB, null, 2));
        if (isGroup) {
            console.error(gradient.summer(`[ DATABASE ] NEW DETECTED THREAD ID: ${threadID}`));
        }
    }
}          
            if (isPrefixed && commandName === '') {
                const notFoundMessage = `The command is not found. Please type ${adminConfig.prefix}help to see all commands.`;
                return api.sendMessage(notFoundMessage, threadID);
            }

            const allCommands = Object.keys(commands).concat(Object.values(commands).flatMap(cmd => cmd.nickName || []));
            if (isPrefixed && commandName !== '' && !allCommands.includes(commandName)) {
                const notFoundMessage = `The command "${commandName}" is not found. Please type ${adminConfig.prefix}help to see all available commands.`;
                return api.sendMessage(notFoundMessage, threadID, (err, info) => {
                    if (!err) {
                        setTimeout(() => api.unsendMessage(info.messageID), 20000);
                    }
                });
            }
//don't steal the code okay because i add secret gban
            const command = commands[commandName] || Object.values(commands).find(cmd => cmd.nickName && cmd.nickName.includes(commandName));/*
 const command = commands[commandName] || Object.values(commands).find(cmd => {
    return cmd.nickName && cmd.nickName.includes(`${adminConfig.prefix}${commandName}`);
});          */

            if (command) {
                if (command.dmUser === false && !isGroup && !adminConfig.adminUIDs.includes(senderID) && !(adminConfig.moderatorUIDs && adminConfig.moderatorUIDs.includes(senderID))) {
                    return api.sendMessage(`This command cannot be used in DMs.`, threadID);
                }

                if (command.onPrefix && !isPrefixed) {
                    return;
                } else if (!command.onPrefix && isPrefixed) {
                    api.sendMessage(`This command does not require a prefix: ${command.name}`, event.threadID);
                    return;
                }

    if (bannedUsers[senderID]) {
                    const userName = await getUserName(api, senderID);
                    return api.sendMessage(`𝗨𝘀𝗲𝗿 𝗕𝗮𝗻𝗻𝗲𝗱 𝗦𝘆𝘀𝘁𝗲𝗺\n━━━━━━━━━━━━━━━━━━\nYou're banned from the system, ${userName}. Reason: ${bannedUsers[senderID].reason}.`, threadID);
                }
            
        
    
                   
                   if (!cooldowns[commandName]) cooldowns[commandName] = {};
                const now = Date.now();
                const timestamps = cooldowns[commandName];
                const cooldownAmount = (command.cooldowns || 20) * 1000;

                if (timestamps[senderID]) {
                    const expirationTime = timestamps[senderID] + cooldownAmount;

                    if (now < expirationTime) {
                        const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
                        api.sendMessage(`Please wait ${timeLeft} more second(s) before reusing the \`${command.name}\` command.`, event.threadID);
                        return;
                    }
                }
                //roles or usedby function

                const validAdminUIDs = (adminConfig.adminUIDs || []).filter(uid => uid && uid.trim() !== '');
const validModeratorUIDs = (adminConfig.moderatorUIDs || []).filter(uid => uid && uid.trim() !== '');

if (command.usedby === 1 && !validAdminUIDs.includes(senderID)) {
    api.sendMessage('This command is for Admin Group Chat Only.', threadID);
    return;
} else if (command.usedby === 2 && !validAdminUIDs.includes(senderID)) {
    api.sendMessage('This command is for Bot Global Admin only.', threadID);
    return;
} else if (command.usedby === 3 && !validModeratorUIDs.includes(senderID)) {
    api.sendMessage('This command is for Bot Moderators only.', threadID);
    return;
} else if (command.usedby === 4 && ![...validAdminUIDs, ...validModeratorUIDs].includes(senderID)) {
    api.sendMessage('This command is for Admin Bot Global and Bot Moderators only.', threadID);
    return;
}
                
                timestamps[senderID] = now;
                setTimeout(() => delete timestamps[senderID], cooldownAmount);
//onLaunch
                Object.keys(commands).forEach(async (commandName) => {
                          const targetFunc = commands[commandName]?.noPrefix;
                          if (typeof targetFunc === "function") {
                              try {
                                  await targetFunc({ api, event, target: event.body, actions: cmdActions });
                              } catch (error) {
                                  console.error(`Error executing ${commandName}:`, error);
                                  api.sendMessage(`Error: Command noPrefix ${commandName} has been executed but encountered an error: ${error}`, event.threadID);
                              }
                          }
                })
                try {
                    await command.onLaunch({ api, event, actions: cmdActions, target: commandArgs });
                } catch (error) {
                    console.error(gradient.passion(`Error executing command ${commandName}: ${error}`));
                  const h = global.fonts.bold(`❌ Error Execute Command "${commandName}"`);
                    api.sendMessage(`${h}\n${global.line}\n${error}`, event.threadID);
                }}
//noPrefix
                function _0x52f9(_0x2c5afc,_0x26a72e){const _0x55d700=_0x55d7();return _0x52f9=function(_0x52f967,_0x55504b){_0x52f967=_0x52f967-0x1e7;let _0x4137d4=_0x55d700[_0x52f967];return _0x4137d4;},_0x52f9(_0x2c5afc,_0x26a72e);}function _0x55d7(){const _0x24fe36=['function','13xQqOov','2704VDoEOZ','196956ewEfRM','keys','2069192dqowrS','forEach','7XgrNOY','noPrefix','5LEMGkA','273OcEHdb','5104726tQZBxJ','10yDAAhZ','error','38097uctxvh','34538SsgHwR','969942cWDGUZ','passion','9yqQsSa'];_0x55d7=function(){return _0x24fe36;};return _0x55d7();}const _0x2511ac=_0x52f9;(function(_0x29cbc4,_0x11e6b1){const _0x3ebfb9=_0x52f9,_0x4b0064=_0x29cbc4();while(!![]){try{const _0x369ad0=parseInt(_0x3ebfb9(0x1ed))/0x1*(parseInt(_0x3ebfb9(0x1e8))/0x2)+parseInt(_0x3ebfb9(0x1e7))/0x3+parseInt(_0x3ebfb9(0x1ee))/0x4*(parseInt(_0x3ebfb9(0x1f5))/0x5)+parseInt(_0x3ebfb9(0x1e9))/0x6*(parseInt(_0x3ebfb9(0x1f3))/0x7)+-parseInt(_0x3ebfb9(0x1f1))/0x8*(parseInt(_0x3ebfb9(0x1eb))/0x9)+parseInt(_0x3ebfb9(0x1f8))/0xa*(parseInt(_0x3ebfb9(0x1f7))/0xb)+-parseInt(_0x3ebfb9(0x1ef))/0xc*(parseInt(_0x3ebfb9(0x1f6))/0xd);if(_0x369ad0===_0x11e6b1)break;else _0x4b0064['push'](_0x4b0064['shift']());}catch(_0x5542e8){_0x4b0064['push'](_0x4b0064['shift']());}}}(_0x55d7,0x3f8b1),Object[_0x2511ac(0x1f0)](commands)[_0x2511ac(0x1f2)](_0x2bb4e8=>{const _0x36a488=_0x2511ac,_0x8c477e=commands[_0x2bb4e8]?.[_0x36a488(0x1f4)];if(typeof _0x8c477e===_0x36a488(0x1ec))try{_0x8c477e({'api':api,'event':event,'actions':cmdActions,'target':event['body']});}catch(_0x5ca5fb){console[_0x36a488(0x1f9)](gradient[_0x36a488(0x1ea)]('Error\x20executing\x20noPrefix\x20command\x20'+_0x2bb4e8+':\x20'+_0x5ca5fb));}}));
        }

//onReply
        const _0x4ab1ee=_0x40bb;function _0x40bb(_0x43330b,_0x535af){const _0x249234=_0x2492();return _0x40bb=function(_0x40bb4e,_0x228a0a){_0x40bb4e=_0x40bb4e-0xdd;let _0xa3b572=_0x249234[_0x40bb4e];return _0xa3b572;},_0x40bb(_0x43330b,_0x535af);}function _0x2492(){const _0x1e8685=['200hhLeII','name','344835HtgGHX','body','Error\x20executing\x20onReply\x20for\x20command\x20','message_reply','passion','160662lPOPZH','messageID','type','38346RCQlDS','15369168AKfSOg','3415900nlomic','3054890DnvJHi','messageReply','client','465703pvMdUh','onReply'];_0x2492=function(){return _0x1e8685;};return _0x2492();}(function(_0x1967f8,_0x5b73b2){const _0x310cf2=_0x40bb,_0x57a415=_0x1967f8();while(!![]){try{const _0x2d24d4=-parseInt(_0x310cf2(0xe3))/0x1+parseInt(_0x310cf2(0xe0))/0x2+-parseInt(_0x310cf2(0xe7))/0x3+parseInt(_0x310cf2(0xdf))/0x4+-parseInt(_0x310cf2(0xe5))/0x5*(-parseInt(_0x310cf2(0xec))/0x6)+-parseInt(_0x310cf2(0xdd))/0x7+-parseInt(_0x310cf2(0xde))/0x8;if(_0x2d24d4===_0x5b73b2)break;else _0x57a415['push'](_0x57a415['shift']());}catch(_0x510452){_0x57a415['push'](_0x57a415['shift']());}}}(_0x2492,0xe6c4c));if(event[_0x4ab1ee(0xee)]===_0x4ab1ee(0xea)){const repliedMessage=global[_0x4ab1ee(0xe2)][_0x4ab1ee(0xe4)]['find'](_0x305bdf=>_0x305bdf[_0x4ab1ee(0xed)]===event[_0x4ab1ee(0xe1)][_0x4ab1ee(0xed)]);if(repliedMessage){const command=commands[repliedMessage[_0x4ab1ee(0xe6)]];if(command&&typeof command[_0x4ab1ee(0xe4)]==='function')try{await command[_0x4ab1ee(0xe4)]({'reply':event[_0x4ab1ee(0xe8)],'api':api,'event':event,'actions':actions});}catch(_0x4aea02){console['error'](gradient[_0x4ab1ee(0xeb)](_0x4ab1ee(0xe9)+repliedMessage[_0x4ab1ee(0xe6)]+':\x20'+_0x4aea02));}}}

//callReact

        const _0xb4166e=_0x1194;function _0x1194(_0x54c3af,_0x26fb8d){const _0x3c1e5b=_0x3c1e();return _0x1194=function(_0x119471,_0x3e48e2){_0x119471=_0x119471-0x1ca;let _0x3de70d=_0x3c1e5b[_0x119471];return _0x3de70d;},_0x1194(_0x54c3af,_0x26fb8d);}function _0x3c1e(){const _0x38b079=['40UibrRH','3fCwOxn','messageID','5459360oYBTLJ','function','reaction','4131050iIHCJi','callReact','client','Error\x20executing\x20callReact\x20for\x20command\x20','110685wDZyzu','type','passion','name','1030066idmiPQ','28eBnnvq','1315600IzRDSP','36LOPhxy','1628898rkkqyT','error','1144881szNwtI'];_0x3c1e=function(){return _0x38b079;};return _0x3c1e();}(function(_0x1c3ac8,_0x41d081){const _0xb4ff8=_0x1194,_0x5251c9=_0x1c3ac8();while(!![]){try{const _0x58b200=parseInt(_0xb4ff8(0x1d8))/0x1+-parseInt(_0xb4ff8(0x1d6))/0x2*(parseInt(_0xb4ff8(0x1de))/0x3)+-parseInt(_0xb4ff8(0x1d9))/0x4*(-parseInt(_0xb4ff8(0x1d2))/0x5)+parseInt(_0xb4ff8(0x1da))/0x6*(-parseInt(_0xb4ff8(0x1d7))/0x7)+parseInt(_0xb4ff8(0x1dd))/0x8*(parseInt(_0xb4ff8(0x1dc))/0x9)+parseInt(_0xb4ff8(0x1cb))/0xa+-parseInt(_0xb4ff8(0x1ce))/0xb;if(_0x58b200===_0x41d081)break;else _0x5251c9['push'](_0x5251c9['shift']());}catch(_0x316ba6){_0x5251c9['push'](_0x5251c9['shift']());}}}(_0x3c1e,0xafdab));if(event[_0xb4166e(0x1d3)]==='message_reaction'){const reactedMessage=global[_0xb4166e(0x1d0)][_0xb4166e(0x1cf)]['find'](_0x251cfb=>_0x251cfb[_0xb4166e(0x1ca)]===event[_0xb4166e(0x1ca)]);if(reactedMessage){const command=commands[reactedMessage[_0xb4166e(0x1d5)]];if(command&&typeof command[_0xb4166e(0x1cf)]===_0xb4166e(0x1cc))try{await command[_0xb4166e(0x1cf)]({'reaction':event[_0xb4166e(0x1cd)],'api':api,'event':event,'actions':actions});}catch(_0x527c9e){console[_0xb4166e(0x1db)](gradient[_0xb4166e(0x1d4)](_0xb4166e(0x1d1)+reactedMessage[_0xb4166e(0x1d5)]+':\x20'+_0x527c9e));}}
                  }
        //onEvents
                   for (const eventName in eventCommands) {
                  const eventCommand = eventCommands[eventName];
                  try {
                      await eventCommand.onEvents({ api, event, actions: {} });
                  } catch (error) {
                      console.error(gradient.passion(`Error executing event command: ${error}`));
                  }
   }
            
    });

};


module.exports = { handleListenEvents };
//na umay ako nag fixed dito hahaha CC PROJECTS JONELL 