const fs = require("fs");
const path = require("path");

const userFile = path.join(__dirname, "../database/ban/users.json");
const threadFile = path.join(__dirname, "../database/ban/threads.json");

let bannedUsers = {};
let bannedThreads = {};

function loadBannedData() {
    try {
        bannedUsers = JSON.parse(fs.readFileSync(userFile));
    } catch (err) {
        console.error("Error reading banned users data file:", err);
    }

    try {
        bannedThreads = JSON.parse(fs.readFileSync(threadFile));
    } catch (err) {
        console.error("Error reading banned threads data file:", err);
    }
}

loadBannedData();

fs.watchFile(userFile, () => {
    try {
        const data = JSON.parse(fs.readFileSync(userFile));
        bannedUsers = data;
        console.log("Banned users data auto-reloaded.");
    } catch (err) {
        console.error("Error auto-reloading banned users:", err);
    }
});

fs.watchFile(threadFile, () => {
    try {
        const data = JSON.parse(fs.readFileSync(threadFile));
        bannedThreads = data;
        console.log("Banned threads data auto-reloaded.");
    } catch (err) {
        console.error("Error auto-reloading banned threads:", err);
    }
});

const saveBannedData = () => {
    try {
        fs.writeFileSync(userFile, JSON.stringify(bannedUsers, null, 2));
        fs.writeFileSync(threadFile, JSON.stringify(bannedThreads, null, 2));
    } catch (err) {
        console.error("Error saving banned data:", err);
    }
};

module.exports = { bannedUsers, bannedThreads, saveBannedData };