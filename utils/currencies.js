const fs = require('fs');
const path = './database/currencies.json';

if (!fs.existsSync(path)) {
  fs.writeFileSync(path, '{}');
}

const raw = JSON.parse(fs.readFileSync(path, 'utf-8'));
const currencies = new Map(Object.entries(raw));

currencies.setCurrency = function (type, amount, userID) {
  if (!currencies.has(userID)) currencies.set(userID, { dollars: 0, xp: 0, xpBuffer: 0 });

  const data = currencies.get(userID);
  data[type] = amount;
  currencies.set(userID, data);

  const json = Object.fromEntries(currencies);
  fs.writeFileSync(path, JSON.stringify(json, null, 2));

  return `Successfully set ${type} to ${amount} for user ID ${userID}`;
};

currencies.addCurrency = function (type, amount, userID) {
  if (!currencies.has(userID)) currencies.set(userID, { dollars: 0, xp: 0, xpBuffer: 0 });

  const data = currencies.get(userID);
  data[type] = (data[type] || 0) + amount;
  currencies.set(userID, data);

  const json = Object.fromEntries(currencies);
  fs.writeFileSync(path, JSON.stringify(json, null, 2));

  return `Successfully added ${amount} ${type} to user ID ${userID}`;
};

currencies.deleteCurrency = function (type, userID) {
  if (!currencies.has(userID)) return `User ID ${userID} does not exist`;

  const data = currencies.get(userID);
  if (!(type in data)) return `${type} does not exist for user ID ${userID}`;

  delete data[type];
  currencies.set(userID, data);

  const json = Object.fromEntries(currencies);
  fs.writeFileSync(path, JSON.stringify(json, null, 2));

  return `Successfully deleted ${type} from user ID ${userID}`;
};

module.exports = currencies;