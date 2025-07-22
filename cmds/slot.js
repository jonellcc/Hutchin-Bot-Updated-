const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/currencies.json');

function loadDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "slot",
  info: "Slot game, bet money and try your luck!",
  dev: "zach (converted by you)",
  onPrefix: true,
  dmUser: false,
  nickName: [],
  usages: "[amount]",
  cooldowns: 100,
  category: "economy",

  onLaunch: async function ({ event, target = [], actions }) {
    const { senderID } = event;
    const db = loadDB();

    if (!db[senderID]) {
      db[senderID] = { dollars: 0, xp: 0 };
    }

    const user = db[senderID];
    const amountInput = target[0];

    if (!amountInput || isNaN(amountInput) || parseInt(amountInput) <= 0) {
      return actions.reply("❌ Please enter a valid and positive amount to bet.");
    }

    const amount = parseInt(amountInput);

    if (amount > user.dollars) {
      return actions.reply("❌ You don't have enough money to place that bet.");
    }

    const slots = ["💚", "💛", "💙"];
    let slot1, slot2, slot3;
    let winnings = 0;

    const winChance = Math.random();

    if (winChance <= 0.15) { // 15% chance to win
      const winSymbol = slots[Math.floor(Math.random() * slots.length)];
      slot1 = slot2 = slot3 = winSymbol;

      winnings = amount * 2;
      user.dollars += winnings;
      user.xp += 50;
      saveDB(db);

      return actions.reply(`🎰 [ ${slot1} | ${slot2} | ${slot3} ]\n🎉 You won $${winnings} and gained 50 XP!\n💰 Total: $${user.dollars} | ⚡ XP: ${user.xp}`);
    } else {
      // Force a loss (not all 3 same)
      do {
        slot1 = slots[Math.floor(Math.random() * slots.length)];
        slot2 = slots[Math.floor(Math.random() * slots.length)];
        slot3 = slots[Math.floor(Math.random() * slots.length)];
      } while (slot1 === slot2 && slot2 === slot3);

      winnings = -amount;
      user.dollars += winnings;
      user.xp = Math.max(0, user.xp - 30); // Prevent negative XP
      saveDB(db);

      return actions.reply(`🎰 [ ${slot1} | ${slot2} | ${slot3} ]\n❌ You lost $${amount} and lost 30 XP.\n💰 Total: $${user.dollars} | ⚡ XP: ${user.xp}`);
    }
  }
};