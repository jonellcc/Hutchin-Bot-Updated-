const fs = require('fs');
const path = require('path');
const WebSocket = require("ws");
const axios = require("axios");

const DB_PATH = path.join(__dirname, 'gagstock_db.json');
const GROUP_DB_PATH = path.join(__dirname, 'gagstock_groups.json');

let database = {
  activeSessions: {},
  lastSentCache: {},
  favoriteMap: {},
  globalLastSeen: {}
};

let groupSubscriptions = {};

function loadDatabase() {
  if (fs.existsSync(DB_PATH)) {
    database = JSON.parse(fs.readFileSync(DB_PATH));
  }
  if (fs.existsSync(GROUP_DB_PATH)) {
    groupSubscriptions = JSON.parse(fs.readFileSync(GROUP_DB_PATH));
  }
}
function saveDatabase() {
  fs.writeFileSync(DB_PATH, JSON.stringify(database, null, 2));
  fs.writeFileSync(GROUP_DB_PATH, JSON.stringify(groupSubscriptions, null, 2));
}
loadDatabase();

let sharedWebSocket = null;
let keepAliveInterval = null;

function cleanText(text) {
  return text.trim().toLowerCase();
}
function getPHTime() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
}
function getCountdownToPH10PM() {
  const now = getPHTime();
  const tenPM = new Date(now);
  tenPM.setHours(22, 0, 0, 0);
  if (now >= tenPM) tenPM.setDate(tenPM.getDate() + 1);
  const diff = tenPM - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}
function getTimeAgo(date) {
  const now = getPHTime();
  const diff = now - new Date(date);
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  if (sec < 60) return `${sec}s ago`;
  if (min < 60) return `${min}m ago`;
  if (hour < 24) return `${hour}h ago`;
  return `${day}d ago`;
}
function formatValue(val) {
  if (val >= 1_000_000) return `x${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `x${(val / 1_000).toFixed(1)}K`;
  return `x${val}`;
}
function formatItems(items, useEmoji = true) {
  return items.map(i => `- ${useEmoji && i.emoji ? i.emoji + " " : ""}${i.name}: ${formatValue(i.quantity)}`).join("\n");
}
function updateLastSeen(category, items) {
  if (!Array.isArray(items)) return;
  if (!database.globalLastSeen[category]) database.globalLastSeen[category] = {};
  const now = getPHTime().toISOString();
  for (const item of items) {
    database.globalLastSeen[category][item.name] = now;
  }
  saveDatabase();
}

function ensureWebSocketConnection(api) {
  if (sharedWebSocket && sharedWebSocket.readyState === WebSocket.OPEN) return;

  sharedWebSocket = new WebSocket("wss://gagstock.gleeze.com");

  sharedWebSocket.on("open", () => {
    keepAliveInterval = setInterval(() => {
      if (sharedWebSocket.readyState === WebSocket.OPEN) {
        sharedWebSocket.send("ping");
      }
    }, 10000);
  });

  sharedWebSocket.on("message", async (data) => {
    try {
      const payload = JSON.parse(data);
      if (payload.status !== "success") return;

      const stock = payload.data;
      const stockData = {
        gear: stock.gear,
        seed: stock.seed,
        egg: stock.egg,
      };

      Object.keys(stockData).forEach(cat => {
        updateLastSeen(cat, stockData[cat].items);
      });

      const processAndSend = async (id, isGroup = false) => {
        const favList = database.favoriteMap[id] || [];
        let sections = [];
        let matchCount = 0;
        const triggerItems = ["master sprinkler", "sugar apple", "burning bud", "ember lily", "beanstalk", "godly sprinkler"];
        let foundTriggerItem = false;

        function checkAndAdd(label, section, useEmoji) {
          const items = Array.isArray(section.items) ? section.items : [];
          const matchedItems = favList.length > 0 ? items.filter(i => favList.includes(cleanText(i.name))) : items;
          if (favList.length > 0 && matchedItems.length === 0) return false;
          if (matchedItems.some(i => triggerItems.includes(cleanText(i.name)))) foundTriggerItem = true;
          matchCount += matchedItems.length;
          sections.push(`${label}:\n${formatItems(matchedItems, useEmoji)}\n⏳ Restock In: ${section.countdown}`);
        }

        checkAndAdd("🛠️ Gear", stockData.gear, true);
        checkAndAdd("🌱 Seeds", stockData.seed, true);
        checkAndAdd("🥚 Eggs", stockData.egg, true);

        if (favList.length > 0 && matchCount === 0) return;
        if (sections.length === 0) return;

        const updatedAt = getPHTime().toLocaleString("en-PH", {
          hour: "numeric", minute: "numeric", second: "numeric",
          hour12: true, day: "2-digit", month: "short", year: "numeric"
        });

        const weather = await axios.get("https://growagardenstock.com/api/stock/weather").then(res => res.data).catch(() => null);
        const weatherInfo = weather
          ? `🌤️ Weather: ${weather.icon} ${weather.weatherType}\n📋 ${weather.description}\n🎯 ${weather.cropBonuses}\n`
          : "";

        const title = favList.length > 0
          ? `♥️ ${matchCount} favorite item${matchCount > 1 ? "s" : ""} found!`
          : "🌾 Grow A Garden — Tracker";

        const finalMessage = `${title}\n\n${sections.join("\n\n")}\n\n${weatherInfo}📅 Updated at (PH): ${updatedAt}\n\n⏳ Next Update GROW A GARDEN: ${getCountdownToPH10PM()}`;

        if (isGroup && foundTriggerItem) {
          try {
            const threadInfo = await api.getThreadInfo(id);
            const botID = api.getCurrentUserID();
            const userIDs = threadInfo.participantIDs.filter(uid => uid !== botID);
            let mentions = [];
            let body = "";
            let index = 0;
            userIDs.forEach(uid => {
              const tag = "\u200B";
              mentions.push({ id: uid, tag, fromIndex: index });
              body += tag;
              index += tag.length;
            });
            body += "\n🚨 Rare item in stock!";
            await api.sendMessage({ body, mentions }, id);
          } catch (err) {
            console.error("Mention error:", err);
          }
        }

        api.sendMessage(finalMessage, id);
      };

      Object.keys(database.activeSessions).forEach(id => processAndSend(id));
      Object.keys(groupSubscriptions).forEach(id => processAndSend(id, true));
    } catch (e) {
      console.error("WebSocket error:", e);
    }
  });

  sharedWebSocket.on("close", () => {
    clearInterval(keepAliveInterval);
    sharedWebSocket = null;
  });

  sharedWebSocket.on("error", () => sharedWebSocket?.close());
}

module.exports = {
  name: "gagstock",
  info: "Track Grow A Garden stock and updates",
  dev: "CC PROJECTS + zach",
  onPrefix: true,
  dmUser: true,
  usages: "gagstock on | off | fav add Carrot | lastseen gear",
  cooldowns: 5,

  onLaunch: async function ({ api, event, actions }) {
    const args = event.body.split(" ").slice(1);
    const subcmd = args[0]?.toLowerCase();
    const senderId = event.senderID;
    const threadId = event.threadID;
    const isGroup = event.isGroup;

    if (subcmd === "on") {
      if (isGroup) return actions.reply("⚠️ Use 'gagstock group on' to enable it in groups.");
      database.activeSessions[senderId] = true;
      saveDatabase();
      ensureWebSocketConnection(api);
      return actions.reply("✅ Gagstock tracking started!");
    }

    if (subcmd === "off") {
      delete database.activeSessions[senderId];
      delete database.lastSentCache[senderId];
      saveDatabase();
      return actions.reply("🛑 Gagstock tracking stopped.");
    }

    if (subcmd === "group") {
      const groupAction = args[1]?.toLowerCase();
      if (!isGroup) return actions.reply("⚠️ Use this command in a group.");
      if (groupAction === "on") {
        groupSubscriptions[threadId] = true;
        saveDatabase();
        ensureWebSocketConnection(api);
        return actions.reply("✅ Gagstock tracking enabled for this group.");
      } else if (groupAction === "off") {
        delete groupSubscriptions[threadId];
        saveDatabase();
        return actions.reply("🛑 Gagstock tracking disabled for this group.");
      }
      return actions.reply("📌 Usage: gagstock group on/off");
    }

    if (subcmd === "fav") {
      const action = args[1]?.toLowerCase();
      const input = args.slice(2).join(" ").split("|").map(i => cleanText(i)).filter(Boolean);
      if (!["add", "remove"].includes(action) || input.length === 0) {
        return actions.reply("📌 Usage: gagstock fav add/remove Item1 | Item2");
      }
      if (!database.favoriteMap[senderId]) database.favoriteMap[senderId] = [];
      const updated = new Set(database.favoriteMap[senderId]);

      input.forEach(name => {
        if (action === "add") updated.add(name);
        else updated.delete(name);
      });

      database.favoriteMap[senderId] = Array.from(updated);
      saveDatabase();
      return actions.reply(`✅ Favorites updated: ${Array.from(updated).join(", ")}`);
    }

    if (subcmd === "lastseen") {
      const filters = args.slice(1).join(" ").split("|").map(c => c.trim().toLowerCase()).filter(Boolean);
      const categories = filters.length > 0 ? filters : ["gear", "seed", "egg"];
      const result = [];

      for (const cat of categories) {
        const entries = database.globalLastSeen[cat];
        if (!entries || Object.keys(entries).length === 0) continue;

        const list = Object.entries(entries)
          .sort((a, b) => new Date(b[1]) - new Date(a[1]))
          .map(([name, date]) => `• ${name}: ${getTimeAgo(date)}`);

        result.push(`🔹 ${cat.toUpperCase()} (${list.length})\n${list.join("\n")}`);
      }

      if (result.length === 0) {
        return actions.reply("⚠️ No last seen data found.");
      }

      return actions.reply(`📦 Last Seen Items\n\n${result.join("\n\n")}`);
    }

    return actions.reply(`📌 Usage:
• gagstock on/off
• gagstock fav add Carrot | Watering Can
• gagstock lastseen gear | seed
• gagstock group on/off (for groups)`);
  }
};
