const fs = require('fs');
const path = require('path');

module.exports = {
    name: "antirobbery",
    info: "Toggle anti-admin theft protection",
    dev: "jonell and zach",
    onPrefix: true,
    dmUser: false,
    nickName: ["antitheft", "guard"],
    usages: "Type {pn}antirobbery to toggle protection",
    cooldowns: 5,

    onLaunch: async function({ api, event, actions }) {
        const dbPath = path.join(__dirname, './database/antirobbery.json');
        const threadID = event.threadID;
        const senderID = event.senderID;

        if (!fs.existsSync(path.dirname(dbPath))) {
            fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        }

        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, '{}');
        }

        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const info = await api.getThreadInfo(threadID);

        if (!info.adminIDs.some(item => item.id == api.getCurrentUserID())) {
            const botNoAdmin = global.textFormat({
                Title: `**⛔ Permission Denied**`,
                Description: `**I need admin rights to activate Anti-Robbery.**\nPlease promote me to admin.`,
                Footer: `**⚙️ Protection System**`
            });
            const msg = await actions.reply(botNoAdmin);
            setTimeout(() => api.unsendMessage(msg.messageID), 26000);
            return;
        }

        if (!info.adminIDs.some(item => item.id == senderID)) {
            const userNoAdmin = global.textFormat({
                Title: `**❌ Access Denied**`,
                Description: `**Only group admins** can toggle Anti-Robbery settings.`,
                Footer: `**🔐 Admin Verification Failed**`
            });
            const msg = await actions.reply(userNoAdmin);
            setTimeout(() => api.unsendMessage(msg.messageID), 26000);
            return;
        }

        if (!data[threadID]) data[threadID] = { guard: false };
        data[threadID].guard = !data[threadID].guard;

        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

        const toggled = global.textFormat({
            Title: `**🛡️ Anti-Robbery Protection**`,
            Description: `**Status:** ${data[threadID].guard ? '**✅ Activated**' : '**❌ Deactivated**'}\n**Group ID:** ${threadID}`,
            Footer: `**🔁 Use again to toggle**`
        });

        const msg = await actions.reply(toggled);
        setTimeout(() => api.unsendMessage(msg.messageID), 26000);
    }
};