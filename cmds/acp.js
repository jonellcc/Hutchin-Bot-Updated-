const fs = require('fs');
const path = require('path');
const moment = require("moment-timezone");

const PENDING_FILE = path.resolve(__dirname, 'cache', 'pending_friends.json');

function savePendingFriends(pending) {
    fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));
}

function loadPendingFriends() {
    if (fs.existsSync(PENDING_FILE)) {
        const data = fs.readFileSync(PENDING_FILE, 'utf8');
        return JSON.parse(data);
    }
    return [];
}

module.exports = {
    name: "accept",
    info: "Manage friend requests",
    dev: "ZiaRein",
    onPrefix: true,
    dmUser: false,
    nickName: [],
    usages: "uid",
    cooldowns: 0,
    category: "admin",

    onReply: async function ({ api, event, reply }) {
        const { threadID, body, senderID } = event;
        const pending = loadPendingFriends();

        const replyContext = global.client.onReply.find(
            r => r.author === senderID && r.name === this.name
        );

        if (!replyContext) return;

        const parts = body.trim().split(/\s+/);
        if (parts.length < 2 && !body.includes("all")) {
            return api.sendMessage("Invalid format. Use: [number/all] [add/del]", threadID);
        }

        const action = parts[1]?.toLowerCase() || (body.includes("add") ? "add" : "del");
        const isAll = body.includes("all");

        if (action !== "add" && action !== "del") {
            return api.sendMessage("Invalid action. Use 'add' or 'del'.", threadID);
        }

        let targets = [];
        if (isAll) {
            targets = pending.map((_, index) => index);
        } else {
            const index = parseInt(parts[0]) - 1;
            if (isNaN(index) || index < 0 || index >= pending.length) {
                return api.sendMessage("Invalid index. Use a number from the list or 'all'.", threadID);
            }
            targets.push(index);
        }

        const results = {
            success: [],
            failed: []
        };

        for (const index of targets) {
            const friendRequest = pending[index];
            const form = {
                av: api.getCurrentUserID(),
                fb_api_caller_class: "RelayModern",
                variables: {
                    input: {
                        source: "friends_tab",
                        actor_id: api.getCurrentUserID(),
                        client_mutation_id: Math.round(Math.random() * 19).toString(),
                        friend_requester_id: friendRequest.node.id
                    },
                    scale: 3,
                    refresh_num: 0
                },
                fb_api_req_friendly_name: action === "add" 
                    ? "FriendingCometFriendRequestConfirmMutation" 
                    : "FriendingCometFriendRequestDeleteMutation",
                doc_id: action === "add" ? "3147613905362928" : "4108254489275063"
            };

            try {
                const response = await api.httpPost("https://www.facebook.com/api/graphql/", {
                    ...form,
                    variables: JSON.stringify(form.variables)
                });

                if (JSON.parse(response).errors) {
                    throw new Error("API error");
                }

                results.success.push(friendRequest.node.name);
            } catch (error) {
                results.failed.push(friendRequest.node.name);
            }
        }

        // Remove processed requests
        if (isAll) {
            savePendingFriends([]);
        } else {
            savePendingFriends(pending.filter((_, i) => !targets.includes(i)));
        }
 const gsgs = global.fonts.bold("Result Friend Pending");
        let resultMessage = `${gsgs}\n${global.line}\n✅ Successfully ${action === "add" ? "accepted" : "rejected"} ${results.success.length} friend requests:\n`;
        resultMessage += results.success.join("\n");

        if (results.failed.length > 0) {
            resultMessage += `\n\n❌ Failed to ${action === "add" ? "accept" : "reject"} ${results.failed.length} requests:\n`;
            resultMessage += results.failed.join("\n");
        }

        api.sendMessage(resultMessage, threadID);

        global.client.onReply = global.client.onReply.filter(
            r => !(r.author === senderID && r.name === this.name)
        );
    },

    onLaunch: async function ({ api, event, actions }) {
        try {
            const form = {
                av: api.getCurrentUserID(),
                fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
                fb_api_caller_class: "RelayModern",
                doc_id: "4499164963466303",
                variables: JSON.stringify({ input: { scale: 3 } })
            };

            const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);
            const listRequest = JSON.parse(response).data.viewer.friending_possibilities.edges;
            savePendingFriends(listRequest);

            if (listRequest.length === 0) {
                return actions.reply("There are no pending friend requests.");
            }

            let message = "📝 Pending Friend Requests:\n\n";
            listRequest.forEach((req, i) => {
                message += `${i + 1}. ${req.node.name}\n` +
                          `   ID: ${req.node.id}\n` +
                          `   Time: ${moment(req.time * 1009).tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss")}\n\n`;
            });
            message += "Reply with:\n[number] add - To accept\n[number] del - To reject\nall add - To accept all\nall del - To reject all";
   const hshs = global.fonts.bold("Pending Friends Manager");
            const replyMsg = await actions.reply(`${hshs}\n${global.line}\n${message}`);

            if (!global.client.onReply) {
                global.client.onReply = [];
            }

            global.client.onReply.push({
                name: this.name,
                messageID: replyMsg.messageID,
                author: event.senderID,
                timestamp: Date.now()
            });

            setTimeout(() => {
                global.client.onReply = global.client.onReply.filter(
                    r => !(r.messageID === replyMsg.messageID && r.name === this.name)
                );
            }, 50000);

        } catch (error) {
            console.error(error);
            actions.reply("Error fetching friend requests");
        }
    }
};