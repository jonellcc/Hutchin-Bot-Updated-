const fs = require("fs");
const os = require("os");

const threadsDB = JSON.parse(fs.readFileSync("./database/threads.json", "utf8") || "{}");
const usersDB = JSON.parse(fs.readFileSync("./database/users.json", "utf8") || "{}");

module.exports = {
  name: "stats",
  usedby: 0,
  info: "Showing The Status of Bot",
  dev: "Jonell Magallanes",
  onPrefix: true,
  cooldowns: 9,

  onLaunch: async function ({ api, event }) {
    const startTime = Date.now();
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    const uptime = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    const osDetails = `${os.type()} ${os.release()} (${os.arch()})`;
    const latency = Date.now() - startTime;

    const stats = `👤 Users: ${Object.keys(usersDB).length}\n👥 Threads: ${Object.keys(threadsDB).length}\n⏱️ Uptime: ${uptime}\n🖥️ OS: ${osDetails}\n🌐 Latency: ${latency} ms`;

    const msg = await api.sendMessage("Loading...", event.threadID);
    await api.editMessage(`𝗕𝗼𝘁 𝗗𝗮𝘁𝗮 𝗦𝘁𝗮𝘁𝘀\n${global.line}\n${stats}`, msg.messageID);
  }
};