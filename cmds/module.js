const fs = require("fs");
const path = require("path");

module.exports = {
  name: "module",
  usedby: 2,
  info: "Install, uninstall, reload, share or list modules instantly.",
  dmUser: false,
  onPrefix: true,
  dev: "Jonell Magallanes",
  cooldowns: 5,

  onLaunch: async function ({ api, event, target }) {
    const threadID = event.threadID;
    const command = target[0];
    const commandName = target[1];
    const commandCode = target.slice(2).join(" ");

    if (!["install", "uninstall", "reload", "share", "list"].includes(command)) {
      return api.sendMessage(
        `📦 ${global.fonts.bold("Module Manager Help")}\n${global.line}\n` +
        `📥 ${global.fonts.bold("Install")}: -module install <name> <code>\n` +
        `🗑️ ${global.fonts.bold("Uninstall")}: -module uninstall <name>\n` +
        `🔄 ${global.fonts.bold("Reload")}: -module reload <name>\n` +
        `📤 ${global.fonts.bold("Share")}: -module share <name>\n` +
        `📚 ${global.fonts.bold("List")}: -module list\n${global.line}`,
        threadID
      );
    }

    if (command === "list") {
      const files = fs.readdirSync("./cmds").filter(f => f.endsWith(".js"));
      const list = files.length
        ? files.map(f => `📄 ${f.replace(".js", "")}`).join("\n")
        : "No modules found.";
      return api.sendMessage(
        `📚 ${global.fonts.bold("Installed Modules")}\n${global.line}\n${list}`,
        threadID
      );
    }

    if (!commandName) {
      return api.sendMessage("❌ Missing module name.", threadID);
    }

    if (command === "install") {
      const msg = await api.sendMessage("Installing...", threadID);
      try {
        new Function(commandCode);
        const filePath = `./cmds/${commandName}.js`;
        fs.writeFileSync(filePath, commandCode);
        global.cc?.reloadCommand?.(commandName);
        return api.editMessage(
          `✅ 𝗠𝗼𝗱𝘂𝗹𝗲 𝗜𝗻𝘀𝘁𝗮𝗹𝗹𝗲𝗱\n${global.line}\n📦 Successfully installed command ${global.fonts.bold(commandName)}`,
          msg.messageID
        );
      } catch (err) {
        return api.editMessage(
          `❌ 𝗘𝗿𝗿𝗼𝗿 𝗶𝗻 𝗜𝗻𝘀𝘁𝗮𝗹𝗹\n${global.line}\nSyntax Error: ${err.message}`,
          msg.messageID
        );
      }
    }

    if (command === "uninstall") {
      const filePath = `./cmds/${commandName}.js`;
      const recyclePath = path.join(__dirname, "../recycle/commands");
      if (!fs.existsSync(filePath)) {
        return api.sendMessage(`❌ Module "${commandName}" not found.`, threadID);
      }
      if (!fs.existsSync(recyclePath)) fs.mkdirSync(recyclePath, { recursive: true });
      fs.renameSync(filePath, path.join(recyclePath, `${commandName}.js`));
      const msg = await api.sendMessage("Uninstalling...", threadID);
      return api.editMessage(
        `🗑️ 𝗠𝗼𝗱𝘂𝗹𝗲 𝗨𝗻𝗶𝗻𝘀𝘁𝗮𝗹𝗹𝗲𝗱\n${global.line}\n📦 Successfully uninstalled command ${global.fonts.bold(commandName)}`,
        msg.messageID
      );
    }

    if (command === "reload") {
      const msg = await api.sendMessage("Reloading...", threadID);
      try {
        const reloaded = global.cc?.reloadCommand?.(commandName);
        if (!reloaded) throw new Error("Reload failed");
        return api.editMessage(
          `🔄 𝗠𝗼𝗱𝘂𝗹𝗲 𝗥𝗲𝗹𝗼𝗮𝗱𝗲𝗱\n${global.line}\n📦 Successfully Reloaded command ${global.fonts.bold(commandName)}`,
          msg.messageID
        );
      } catch (err) {
        return api.editMessage(`❌ Failed to reload "${commandName}".`, msg.messageID);
      }
    }

    if (command === "share") {
      const filePath = `./cmds/${commandName}.js`;
      if (!fs.existsSync(filePath)) {
        return api.sendMessage(`❌ Module "${commandName}" not found.`, threadID);
      }
      const msg = await api.sendMessage("Extracting...", threadID);
      const code = fs.readFileSync(filePath, "utf-8");
      const stats = fs.statSync(filePath);
      const lines = code.split("\n").length;
      const sizeKB = (stats.size / 1024).toFixed(2);
      return api.editMessage(
        `📤 𝗦𝗵𝗮𝗿𝗲 𝗠𝗼𝗱𝘂𝗹𝗲\n${global.line}\n📁 Path: cmds/${commandName}.js\n📄 Lines: ${lines}\n📦 Size: ${sizeKB} KB\n${global.line}\n\n${code}`,
        msg.messageID
      );
    }
  }
};