const fs = require('fs');
const adminConfig = JSON.parse(fs.readFileSync("admin.json", "utf8"));
module.exports = {
    name: 'prefix',
    ver: '1.0',
    prog: 'Jonell Magallanes',

    onEvents: async function ({ api, event }) {
        if (event.type === 'message') {
            const message = event.body.trim();

            if (message.startsWith(`prefix`) || message.startsWith(`Prefix`) || message.startsWith(`anong prefix`)) {
                const response = `╭┈ ❒ [ ${adminConfig.prefix} ] : 𝙋𝙍𝙀𝙁𝙄𝙓\n |    ⁞ ❏. 𝖳𝗁𝖾 𝖼𝗈𝗆𝗆𝖺𝗇𝖽 𝗒𝗈𝗎 𝖺𝗋𝖾 𝗎𝗌𝗂𝗇𝗀 𝖽𝗈𝖾𝗌 𝗇𝗈𝗍 𝖾𝗑𝗂𝗌𝗍\n╰   ⁞ ❏. 𝗍𝗒𝗉𝖾 ${adminConfig.prefix}𝗁𝖾𝗅𝗉 𝗍𝗈 𝗌𝖾𝖾 𝖺𝗅𝗅 𝖺𝗏𝖺𝗂𝗅𝖺𝖻𝗅𝖾 𝖼𝗈𝗆𝗆𝖺𝗇𝖽𝗌.`;
                api.shareContact(response, api.getCurrentUserID(), event.threadID)
            }
        }
    }
};
