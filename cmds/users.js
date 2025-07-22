const fs = require('fs');

let bannedUsers = {};

try {
    bannedUsers = JSON.parse(fs.readFileSync('./database/ban/users.json'));
} catch (err) {
    console.error("Error reading banned users data file:", err);
}

const saveBannedData = () => {
    fs.writeFileSync('./database/ban/users.json', JSON.stringify(bannedUsers, null, 2));
};

module.exports = {
    name: "users",
    usedby: 4,
    info: "Ban or unban users",
    onPrefix: true,
    cooldowns: 20,

    onLaunch: async function ({ event, target, api }) {
        const action = (target[0] || '').toLowerCase();
        let targetID;
        let reason;

        if (target.length > 1 && /^\d+$/.test(target[1])) {
            targetID = target[1];
            reason = target.slice(2).join(' ') || "No reason provided";
        } else if (event.type === 'message_reply') {
            targetID = event.messageReply.senderID;
            reason = target.slice(1).join(' ') || "No reason provided";
        } else {
            return api.sendMessage(
                "𝗕𝗮𝗻 𝗦𝘆𝘀𝘁𝗲𝗺 𝗨𝘀𝗲𝗿 𝗠𝗮𝗻𝗮𝗴𝗲𝗿\n━━━━━━━━━━━━━━━━━━\nUsage:\n• Reply to a message: `users ban [reason]`\n• Use UID: `users ban <uid> [reason]`",
                event.threadID
            );
        }

        if (!action || !targetID) {
            return api.sendMessage("Invalid command usage. Try: `users ban <uid> [reason]` or reply to a message.", event.threadID);
        }

        let userName;
        try {
            const userInfo = await global.getUser(targetID);
            userName = userInfo.name || targetID;
        } catch (err) {
            console.error("Error fetching user info:", err);
            userName = targetID;
        }

        if (action === 'ban') {
            bannedUsers[targetID] = { reason };
            saveBannedData();
            return api.sendMessage(`𝗨𝘀𝗲𝗿 𝗕𝗮𝗻𝗻𝗲𝗱\n━━━━━━━━━━━━━━━━━━\n${userName} has been banned.\nReason: ${reason}`, event.threadID, () => {
                process.exit(1);
            });
        }

        if (action === 'unban') {
            if (bannedUsers[targetID]) {
                delete bannedUsers[targetID];
                saveBannedData();
                return api.sendMessage(`𝗨𝘀𝗲𝗿 𝗨𝗻𝗯𝗮𝗻𝗻𝗲𝗱\n━━━━━━━━━━━━━━━━━━\n${userName} has been unbanned.`, event.threadID, () => {
                    process.exit(1);
                });
            } else {
                return api.sendMessage(`This user is not banned.`, event.threadID);
            }
        }

        return api.sendMessage("Invalid action. Use `ban` or `unban`.", event.threadID);
    }
};