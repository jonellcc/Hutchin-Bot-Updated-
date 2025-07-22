const os = require("os");

module.exports = {
  name: "uptime",
  usedby: 0,
  dev: "CC PROJECT TEAM",
  info: "Show bot system uptime and info",
  onPrefix: false,
  dmUser: false,
  usages: "uptime",
  cooldowns: 5,

  onLaunch: async ({ api, event }) => {
    const start = Date.now();

    await api.sendMessage({
      body: "Loading.....",
      edit: [
        ["Getting system info...", 500],
        [(() => {
          const end = Date.now();
          const ms = end - start;
          const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
          const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
          const usedMem = (totalMem - freeMem).toFixed(2);
          const uptime = process.uptime();
          const days = Math.floor(uptime / (3600 * 24));
          const hours = Math.floor((uptime % (3600 * 24)) / 3600);
          const min = Math.floor((uptime % 3600) / 60);
          const second = Math.floor(uptime % 60);
          const bold = global.fonts.bold("⚙️ Bot Uptime System");
          return `${bold}\n${global.line}\n🖥️ OS: ${os.type()} ${os.arch()}\n🗃️ RAM: ${usedMem} MB / ${totalMem} MB\n⏱️ Uptime: ${days}d ${hours}h ${min}m ${second}s\nPing: ${ms} ms`;
        })(), 500]
      ]
    }, event.threadID);
  }
};