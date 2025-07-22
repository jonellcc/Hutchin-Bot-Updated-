const fs = require('fs');
const path = require('path');

function formatNumber(num) {
  const units = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion", "Decillion", "Undecillion", "Duodecillion", "Tredecillion"];
  let i = 0;
  while (num >= 1000 && i < units.length - 1) {
    num /= 1000;
    i++;
  }
  return `$${num.toFixed(2)} ${units[i]}`;
}

module.exports = {
  name: "bank",
  info: "Banking system with deposit/withdraw/loan/repay features",
  dev: "Jonell Magallanes",
  onPrefix: true,
  dmUser: true,
  nickName: ["atm"],
  usages: "[deposit/withdraw/loan/repay] [amount]",
  cooldowns: 5,
  category: "economy",

  onLaunch: async function ({ api, event, actions, target }) {
    const currenciesPath = path.join(__dirname, '../database/currencies.json');
    const bankPath = path.join(__dirname, '../database/bank.json');

    if (!fs.existsSync(currenciesPath)) fs.writeFileSync(currenciesPath, JSON.stringify({}, null, 2));
    if (!fs.existsSync(bankPath)) fs.writeFileSync(bankPath, JSON.stringify({}, null, 2));

    const currencies = JSON.parse(fs.readFileSync(currenciesPath, 'utf8'));
    const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
    const senderID = event.senderID;
    const mentionID = Object.keys(event.mentions || {})[0];
    const userId = mentionID || senderID;
    const namen = global.getUser(userId)
    const name = namen.name;

    if (!currencies[userId]) currencies[userId] = { dollars: 0, xp: 0 };
    if (!bank[userId]) bank[userId] = { deposit: 0, loan: 0, creditScore: 100 };

    const action = target[0]?.toLowerCase();
    const amount = parseInt(target[1]);

    if (mentionID && !action) {
      return actions.reply(
        global.textFormat({
          Title: `**🏦 BANK STATEMENT for ${name}**`,
          Description: `💵 Cash: ${formatNumber(currencies[mentionID]?.dollars || 0)}\n` +
            `🏦 Bank: ${formatNumber(bank[mentionID]?.deposit || 0)}\n` +
            `📝 Loan: ${formatNumber(bank[mentionID]?.loan || 0)}\n` +
            `⭐ Credit: ${bank[mentionID]?.creditScore || 100}/100`,
          Footer: `**Bank Statement overview at ${new Date().toLocaleString()}**`
        })
      );
    }

    if (!action) {
      return actions.reply(
        global.textFormat({
          Title: "**🏦 YOUR BANK STATEMENT**",
          Description: `💵 Cash: ${formatNumber(currencies[senderID].dollars)}\n` +
            `🏦 Bank: ${formatNumber(bank[senderID].deposit)}\n` +
            `📝 Loan: ${formatNumber(bank[senderID].loan)}\n` +
            `⭐ Credit: ${bank[senderID].creditScore}/100\n\n` +
            `Usage: -bank [deposit/withdraw/loan/repay] [amount]`,
          Footer: `**Bank statement overview at ${new Date().toLocaleString()}**`
        })
      );
    }

    if (action && (action === "deposit" || action === "withdraw" || action === "loan" || action === "repay")) {
      if (isNaN(amount) || amount <= 0) {
        return actions.reply("❌ Amount must be a positive number");
      }
    }

    try {
      switch (action) {
        case "deposit":
          if (currencies[senderID].dollars < amount)
            return actions.reply(`❌ You only have ${formatNumber(currencies[senderID].dollars)} cash`);
          currencies[senderID].dollars -= amount;
          bank[senderID].deposit += amount;
          fs.writeFileSync(currenciesPath, JSON.stringify(currencies, null, 2));
          fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));

          return actions.reply(
            global.textFormat({
              Title: `**Deposit Successful**`,
              Description: `✅ You have successfully deposited ${formatNumber(amount)}.\n` +
                `💵 Your new balance is ${formatNumber(currencies[senderID].dollars)} cash.\n` +
                `🏦 Your new bank balance is ${formatNumber(bank[senderID].deposit)}.`,
              Footer: `**Deposit completed at ${new Date().toLocaleString()}**`
            })
          );

        case "withdraw":
          if (bank[senderID].deposit < amount)
            return actions.reply(`❌ Your bank balance is only ${formatNumber(bank[senderID].deposit)}.`);
          bank[senderID].deposit -= amount;
          currencies[senderID].dollars += amount;
          fs.writeFileSync(currenciesPath, JSON.stringify(currencies, null, 2));
          fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));

          return actions.reply(
            global.textFormat({
              Title: `**Withdrawal Successful**`,
              Description: `✅ You have successfully withdrawn ${formatNumber(amount)}.\n` +
                `🏦 Your new bank balance is ${formatNumber(bank[senderID].deposit)}.\n` +
                `💵 Your new cash balance is ${formatNumber(currencies[senderID].dollars)}.`,
              Footer: `**Withdrawal completed at ${new Date().toLocaleString()}**`
            })
          );

        case "loan":
          if (bank[senderID].creditScore < 50)
            return actions.reply(`❌ Your credit score is too low (${bank[senderID].creditScore}) to take a loan.`);

          const maxLoanLimit = 5000;
          if (bank[senderID].loan + amount > maxLoanLimit)
            return actions.reply(`❌ Loan denied. You can only borrow up to ${formatNumber(maxLoanLimit)} in total.\n` +
                                 `📝 Current loan: ${formatNumber(bank[senderID].loan)}.`);

          bank[senderID].loan += amount;
          currencies[senderID].dollars += amount;
          bank[senderID].creditScore -= 10;
          fs.writeFileSync(currenciesPath, JSON.stringify(currencies, null, 2));
          fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));

          return actions.reply(
            global.textFormat({
              Title: `**Loan Approved**`,
              Description: `✅ You have successfully taken a loan of ${formatNumber(amount)}.\n` +
                `💵 Your new cash balance is ${formatNumber(currencies[senderID].dollars)}.\n` +
                `📝 Your total loan amount is now ${formatNumber(bank[senderID].loan)}.\n` +
                `⭐ Your new credit score is ${bank[senderID].creditScore}/100.`,
              Footer: `**Loan granted at ${new Date().toLocaleString()}**`
            })
          );

        case "repay":
          if (bank[senderID].loan < amount)
            return actions.reply(`❌ You don't have that much loan to repay. Your outstanding loan is ${formatNumber(bank[senderID].loan)}.`);
          if (currencies[senderID].dollars < amount)
            return actions.reply(`❌ You don't have enough cash to repay ${formatNumber(amount)}.`);

          bank[senderID].loan -= amount;
          currencies[senderID].dollars -= amount;
          bank[senderID].creditScore += 5;
          fs.writeFileSync(currenciesPath, JSON.stringify(currencies, null, 2));
          fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));

          return actions.reply(
            global.textFormat({
              Title: `**Loan Repayment Successful**`,
              Description: `✅ You have successfully repaid ${formatNumber(amount)} of your loan.\n` +
                `💵 Your new cash balance is ${formatNumber(currencies[senderID].dollars)}.\n` +
                `📝 Your remaining loan balance is ${formatNumber(bank[senderID].loan)}.\n` +
                `⭐ Your new credit score is ${bank[senderID].creditScore}/100.`,
              Footer: `**Repayment completed at ${new Date().toLocaleString()}**`
            })
          );

        default:
          return actions.reply("❌ Invalid action. Please use deposit, withdraw, loan, or repay.");
      }
    } catch (error) {
      return actions.reply(`❌ An error occurred: ${error.message}`);
    }
  }
};