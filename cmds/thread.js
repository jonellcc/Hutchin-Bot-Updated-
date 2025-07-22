const fs = require('fs');
const path = require('path');
const adminConfig = JSON.parse(fs.readFileSync("admin.json", "utf8"));
const THREADS_FILE = path.resolve(__dirname, 'cache', 'threads.json');

function savePendingThreads(pending) {
    fs.writeFileSync(THREADS_FILE, JSON.stringify(pending, null, 2));
}

function loadPendingThreads() {
    if (fs.existsSync(THREADS_FILE)) {
        const data = fs.readFileSync(THREADS_FILE);
        return JSON.parse(data);
    }
    return [];
}

module.exports = {
    name: "threads",
    usedby: 4,
    info: "Manage thread approvals",
    onPrefix: true,
    dev: "Jonell Magallanes",
    cooldowns: 1,

    onReply: async function ({ reply, api, event }) {
        const { threadID, body, senderID } = event;
        const pending = loadPendingThreads();
        var spam = await api.getThreadList(100, null, ["OTHER"]) || [];

        const replyContext = global.client.onReply.find(
            r => r.author === senderID && r.name === this.name
        );

        if (!replyContext) return;

        const parts = body.trim().split(/\s+/);
        if (parts.length < 2) {
            return api.sendMessage("Invalid format. Use: [number] [approve/decline]", threadID);
        }

        const index = parseInt(parts[0]) - 1;
        const action = parts[1].toLowerCase();

        if (isNaN(index) || index < 0 || index >= pending.length) {
            return api.sendMessage("Invalid index. Use a number from the list.", threadID);
        }

        if (action !== "approve" && action !== "decline") {
            return api.sendMessage("Invalid action. Use 'approve' or 'decline'.", threadID);
        }

        const threadToApprove = pending[index];

        if (action === "approve") {
            await api.sendMessage(
                "𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱 𝗚𝗿𝗼𝘂𝗽 𝗖𝗵𝗮𝘁\n━━━━━━━━━━━━━━━━━━\nYour thread has been successfully approved.", 
                threadToApprove.threadID
            );
            await api.changeNickname(
                `${adminConfig.botName} • [ ${adminConfig.prefix} ]`, 
                threadToApprove.threadID, 
                api.getCurrentUserID()
            );
            await api.sendMessage(
                `⚙️ 𝗧𝗵𝗿𝗲𝗮𝗱𝘀 𝗠𝗮𝗻𝗮𝗴𝗲𝗿 \n━━━━━━━━━━━━━━━━━━\nThe thread "${threadToApprove.name}" has been approved.`, 
                threadID
            );
        } 
        else {
            await api.sendMessage(
                "❌ 𝗬𝗼𝘂𝗿 𝗿𝗲𝗾𝘂𝗲𝘀𝘁 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗱𝗲𝗰𝗹𝗶𝗻𝗲𝗱.", 
                threadToApprove.threadID
            );
            await api.sendMessage(
                `⚙️ 𝗧𝗵𝗿𝗲𝗮𝗱𝘀 𝗠𝗮𝗻𝗮𝗴𝗲𝗿 \n━━━━━━━━━━━━━━━━━━\nThe thread "${threadToApprove.name}" has been declined.`, 
                threadID
            );
        }

        pending.splice(index, 1);
        savePendingThreads(pending);

        global.client.onReply = global.client.onReply.filter(
            r => !(r.author === senderID && r.name === this.name)
        );
    },

    onLaunch: async function ({ api, event, target }) {
        try {
            const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
            var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
            const allThreads = [...pending, ...spam];
            savePendingThreads(allThreads);

            if (allThreads.length === 0) {
                return api.sendMessage(
                    "⚙️ 𝗧𝗵𝗿𝗲𝗮𝗱𝘀 𝗠𝗮𝗻𝗮𝗴𝗲𝗿 \n━━━━━━━━━━━━━━━━━━\nThere are no pending or other threads.", 
                    event.threadID
                );
            }

            let pendingMessage = `⚙️ 𝗧𝗵𝗿𝗲𝗮𝗱𝘀 𝗠𝗮𝗻𝗮𝗴𝗲𝗿 \n━━━━━━━━━━━━━━━━━━\n${allThreads.map((thread, i) => `${i + 1}. ${thread.name}`).join('\n')}\n\nReply with:\n[number] approve - To approve\n[number] decline - To decline`;

            const lad = await api.sendMessage(pendingMessage, event.threadID);

            if (!global.client.onReply) {
                global.client.onReply = [];
            }

            global.client.onReply.push({
                name: this.name,
                messageID: lad.messageID,
                author: event.senderID,
                timestamp: Date.now()
            });

            setTimeout(() => {
                global.client.onReply = global.client.onReply.filter(
                    r => !(r.messageID === lad.messageID && r.name === this.name)
                );
            }, 50000);

        } catch (error) {
            console.error("Error managing threads:", error);
            await api.sendMessage("An error occurred while managing threads.", event.threadID);
        }
    }
};