const fs = require('fs'); const path = require('path'); const moment = require('moment');

const afkDBPath = path.join(__dirname, 'cache', 'afk.json'); let afkDB = {};

if (!fs.existsSync(path.dirname(afkDBPath))) { fs.mkdirSync(path.dirname(afkDBPath), { recursive: true }); }

if (fs.existsSync(afkDBPath)) { afkDB = JSON.parse(fs.readFileSync(afkDBPath)); }

function saveDB() { fs.writeFileSync(afkDBPath, JSON.stringify(afkDB)); }

module.exports = { name: "afk", info: "Set AFK status", dev: "CC", onPrefix: true, dmUser: true, nickName: ["away"], usages: "[reason]", cooldowns: 5,

onLaunch: async function ({ api, event, actions, target }) {
    const userID = event.senderID;
    const reason = target.join(" ") || "no reason provided";
    const bold = global.fonts.bold("AFK Manager");
    const head = `╭┈ ❒ [ ${bold} ]`
    const line = global.line;

    afkDB[userID] = {
        reason: reason,
        time: Date.now(),
        mentioned: false,
        isCommand: true
    };
    saveDB();

    const nameb = await global.getUser(userID);
    const name = nameb.name;

    await actions.reply(`${head}\n${line}\n❏ ${name} is now AFK\n❏ Reason: ${reason}`);
},

noPrefix: async function ({ api, event, actions }) {
    if (!event.body || event.body.startsWith('/afk')) return;

    try {
        const userID = event.senderID;

        if (afkDB[userID]) {
            if (afkDB[userID].isCommand) {
                afkDB[userID].isCommand = false;
                saveDB();
                return;
            }

            const afkData = afkDB[userID];
            const duration = moment.duration(moment().diff(moment(afkData.time)));
            let timeText = duration.asHours() >= 1 ? `${Math.floor(duration.asHours())} hours` :
                duration.asMinutes() >= 1 ? `${Math.floor(duration.asMinutes())} minutes` :
                    `${Math.floor(duration.asSeconds())} seconds`;

            const namehs = await global.getUser(userID);
            const name = namehs.name;
            const bold = global.fonts.bold("Welcome Back");
            const head = `╭┈ ❒ [ ${bold} ]`
            const line = global.line;

            await actions.reply(`${head}\n${line}\n❏ You're back @${name}\n❏ AFK Duration: ${timeText}\n❏ Reason: ${afkData.reason}`);
            delete afkDB[userID];
            saveDB();
            return;
        }

        if (event.mentions) {
            for (const [id, name] of Object.entries(event.mentions)) {
                if (afkDB[id] && !afkDB[id].mentioned) {
                    afkDB[id].mentioned = true;
                    saveDB();

                    const afkTime = moment(afkDB[id].time);
                    const duration = moment.duration(moment().diff(afkTime));
                    let timeText = duration.asHours() >= 1 ? `${Math.floor(duration.asHours())} hours` :
                        duration.asMinutes() >= 1 ? `${Math.floor(duration.asMinutes())} minutes` :
                            `${Math.floor(duration.asSeconds())} seconds`;

                    const bold = global.fonts.bold("User is Busy");
                    const head = `╭┈ ❒ [ ${bold} ]`
                    const line = global.line;

                    await actions.reply(`${head}\n${line}\n❏ This user is currently AFK\n❏ Duration: ${timeText}\n❏ Reason: ${afkDB[id].reason}`);
                }
            }
        }
    } catch (error) {
        console.error("AFK error:", error);
    }
}

};