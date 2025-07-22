const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../database/currencies.json");

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
  name: "rps",
  info: "Play Rock Paper Scissors against the bot!",
  dev: "Prince Sanel (converted by zach)",
  onPrefix: true,
  dmUser: false,
  nickName: [],
  usages: "[✊, ✋, ✌️] [amount]",
  cooldowns: 50,
  category: "economy",

  onLaunch: async function ({ event, target = [], actions }) {
    const { senderID } = event;
    const db = loadDB();

    if (!db[senderID]) {
      db[senderID] = { dollars: 0, xp: 0 };
    }

    const user = db[senderID];
    const userChoice = target[0];
    const betInput = target[1];
    const bet = parseInt(betInput);

    const choices = ["✊", "✋", "✌️"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    if (!userChoice || !choices.includes(userChoice)) {
      return actions.reply("❌ Please choose either ✊, ✋, or ✌️.");
    }

    if (!betInput || isNaN(bet) || bet <= 0) {
      return actions.reply("❌ Please enter a valid amount to bet.");
    }

    if (bet > user.dollars) {
      return actions.reply("💰 You don't have enough money to place that bet.");
    }

    let resultMessage = `🧍 You: ${userChoice}\n🤖 Bot: ${botChoice}\n`;

    if (userChoice === botChoice) {
      resultMessage += "⚖️ It's a tie! No money won or lost.";
    } else if (
      (userChoice === "✊" && botChoice === "✌️") ||
      (userChoice === "✋" && botChoice === "✊") ||
      (userChoice === "✌️" && botChoice === "✋")
    ) {
      const winnings = bet * 2;
      user.dollars += winnings;
      user.xp += 40;
      resultMessage += `🎉 You win $${winnings} and gain 40 XP!`;
    } else {
      user.dollars -= bet;
      user.xp = Math.max(0, user.xp - 25);
      resultMessage += `😢 You lost $${bet} and lost 25 XP.`;
    }

    saveDB(db);

    resultMessage += `\n💰 Balance: $${user.dollars} | ⚡ XP: ${user.xp}`;
    return actions.reply(resultMessage);
  }
};