const fs = require('fs');
const path = require('path');

module.exports = {
    name: "flip",
    info: "Flip a coin and bet money",
    category: "economy",
    usage: "flip [heads/tails] [amount]",
    cooldowns: 2,
    onPrefix: true,
    onLaunch: async function ({ event, target, actions }) {
        const dbPath = path.join(__dirname, '../database/currencies.json');
        
        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
        }

        const currencies = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const senderID = event.senderID;
        const choice = target[0]?.toLowerCase();
        const amount = parseFloat(target[1]);

        if (!['heads', 'tails'].includes(choice)) {
            return actions.reply(
                `${global.fonts.bold("COIN FLIP")}\n${global.line}\n` +
                "Please specify heads or tails\n" +
                `Example: flip heads 100`
            );
        }

        if (isNaN(amount) || amount <= 0) {
            return actions.reply(
                `${global.fonts.bold("COIN FLIP")}\n${global.line}\n` +
                "Please enter a valid bet amount\n" +
                `Example: flip tails 500`
            );
        }

        if (!currencies[senderID]) {
            currencies[senderID] = { dollars: 0, xp: 0 };
        }

        if (currencies[senderID].dollars < amount) {
            return actions.reply(
                `${global.fonts.bold("COIN FLIP")}\n${global.line}\n` +
                `You only have $${currencies[senderID].dollars.toLocaleString()} in your wallet`
            );
        }

        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const win = Math.random() < 0.3; // 30% chance to win

        let message = `${global.fonts.bold("COIN FLIP")}\n${global.line}\n` +
                      `You chose ${choice}\n` +
                      `The coin landed on ${result}\n`;

        if (win && choice === result) {
            currencies[senderID].dollars += amount;
            message += `🎉 You won $${amount.toLocaleString()}!\n` +
                       `New balance: $${currencies[senderID].dollars.toLocaleString()}`;
        } else {
            currencies[senderID].dollars -= amount;
            message += `😢 You lost $${amount.toLocaleString()}\n` +
                       `New balance: $${currencies[senderID].dollars.toLocaleString()}`;
        }

        fs.writeFileSync(dbPath, JSON.stringify(currencies, null, 2));
        actions.reply(message);
    }
};