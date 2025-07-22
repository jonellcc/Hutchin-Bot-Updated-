const fs = require('fs');
const axios = require('axios');
const simPath = './sim.json';

if (!fs.existsSync(simPath)) {
    fs.writeFileSync(simPath, JSON.stringify({}));
}

const axiosInstance = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0'
    }
});

module.exports = {
    name: "sim",
    info: "SimSimi AI chat",
    dev: "Jonell Magallanes",
    onPrefix: true,
    dmUser: true,
    nickName: ["simisimi"],
    usages: "[on/off] or [question]",
    cooldowns: 5,

    onLaunch: async function ({ event, actions, target }) {
        const threadID = event.threadID;
        const simData = JSON.parse(fs.readFileSync(simPath));

        if (target.length === 0) {
            const status = simData[threadID] ? "ON ✅" : "OFF ❌";
            return actions.reply(`Sim status: ${status}\nUsage: /sim [on/off] or /sim [question]`);
        }

        const action = target[0].toLowerCase();
        if (action === 'on') {
            simData[threadID] = true;
            fs.writeFileSync(simPath, JSON.stringify(simData));
            return actions.reply("✅ SimSimi AI enabled for this chat");
        }
        else if (action === 'off') {
            simData[threadID] = false;
            fs.writeFileSync(simPath, JSON.stringify(simData));
            return actions.reply("❌ SimSimi AI disabled for this chat");
        }
        else {
            const question = target.join(" ");
            try {
                const { data } = await axiosInstance.get(`https://ccproject.serv00.net/other/sim/sim.php?query=${encodeURIComponent(question)}`);
                return actions.reply(data);
            } catch {
                return actions.reply("Sorry, I couldn't process that request.");
            }
        }
    },

    noPrefix: async function ({ event, actions }) {
        const simData = JSON.parse(fs.readFileSync(simPath));
        if (simData[event.threadID] !== true) return;

        try {
            const question = encodeURIComponent(event.body);
            const { data } = await axiosInstance.get(`https://ccproject.serv00.net/other/sim/sim.php?query=${question}`);
            await actions.reply(data);
        } catch {
            await actions.reply("Sorry, I couldn't process that request.");
        }
    }
};