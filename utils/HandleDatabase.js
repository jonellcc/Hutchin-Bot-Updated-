const fs = require("fs");

let threadsDB = {};
let usersDB = {};

try {
  const adminConfig = JSON.parse(fs.readFileSync("./admin.json", "utf8"));

  if (adminConfig.database === true) {
    threadsDB = JSON.parse(fs.readFileSync("./database/threads.json", "utf8") || "{}");
    usersDB = JSON.parse(fs.readFileSync("./database/users.json", "utf8") || "{}");
  }
} catch (err) {
  console.error("Failed to load admin config or database files:", err);
}

module.exports = { threadsDB, usersDB };