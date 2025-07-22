const fs = require('fs');
const path = require('path');
const axios = require('axios');

const PROTECTION_FILE = path.join(__dirname, '../cmds/database/antirobbery.json');

const loadProtectionData = () => {
    if (!fs.existsSync(PROTECTION_FILE)) {
        fs.writeFileSync(PROTECTION_FILE, '{}');
        return {};
    }
    return JSON.parse(fs.readFileSync(PROTECTION_FILE, 'utf8'));
};

const saveProtectionData = (data) => {
    const dir = path.dirname(PROTECTION_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PROTECTION_FILE, JSON.stringify(data, null, 2));
};

const downloadImage = async (url, filename) => {
    const res = await axios.get(url, { responseType: 'stream' });
    const imagePath = path.join(__dirname, `../cmds/database/${filename}`);
    const writer = fs.createWriteStream(imagePath);
    res.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(imagePath));
        writer.on('error', reject);
    });
};

const handleAdminChange = async (api, event) => {
    const { logMessageType, logMessageData } = event;
    const protectionData = loadProtectionData();
    const threadID = event.threadID;

    if (!protectionData[threadID]) protectionData[threadID] = {};
    const threadData = protectionData[threadID];

    const info = await api.getThreadInfo(threadID);
    const isAdmin = (id) => info.adminIDs?.some(a => a.id == id);

    if (threadData.guard !== true) {
        let updated = false;

        if (info.threadName && threadData.originalName !== info.threadName) {
            threadData.originalName = info.threadName;
            updated = true;
            console.log(`[ GROUP PROTECTION ] Thread name change detected. Updated to: ${info.threadName}`);
        }

        if (info.imageSrc) {
            const currentImagePath = threadData.originalImage;
            const newImagePath = path.join(__dirname, `../cmds/database/image_${threadID}.jpg`);

            if (currentImagePath && fs.existsSync(currentImagePath)) {
                fs.unlinkSync(currentImagePath);
                console.log(`[ GROUP PROTECTION ] Old group image deleted: ${currentImagePath}`);
            }

            const savedImage = await downloadImage(info.imageSrc, `image_${threadID}.jpg`);
            threadData.originalImage = savedImage;
            updated = true;
            console.log(`[ GROUP PROTECTION ] New group image saved: ${savedImage}`);
        }

        if (updated) {
            saveProtectionData(protectionData);
            console.log(`[ GROUP PROTECTION ] Data updated for threadID ${threadID}`);
        }
    }

    if (!threadData.guard) return;
    if (!threadData.originalName) {
        threadData.originalName = info.threadName;
        if (info.imageSrc) {
            const savedImage = await downloadImage(info.imageSrc, `image_${threadID}.jpg`);
            threadData.originalImage = savedImage;
        }
        saveProtectionData(protectionData);
    }

    if (logMessageType === "log:thread-admins") {
        if (event.author === api.getCurrentUserID()) return;
        if (logMessageData.TARGET_ID === api.getCurrentUserID()) return;

        try {
            if (logMessageData.ADMIN_EVENT === "add_admin") {
                await api.changeAdminStatus(threadID, event.author, false);
                await api.changeAdminStatus(threadID, logMessageData.TARGET_ID, false);
                const msg = global.textFormat({
                    Title: "🛡️  𝗔𝗡𝗧𝗜-𝗥𝗢𝗕𝗕𝗘𝗥𝗬 𝗔𝗖𝗧𝗜𝗩𝗘",
                    Description: "❌  Unauthorized admin promotion detected!\n🧹  Both users demoted.",
                    Footer: "⚠️  Security Mode Triggered"
                });
                api.sendMessage(msg, threadID, (err, info) => {
                    setTimeout(() => api.unsendMessage(info.messageID), 26000);
                });
            } else if (logMessageData.ADMIN_EVENT === "remove_admin") {
                await api.changeAdminStatus(threadID, event.author, false);
                await api.changeAdminStatus(threadID, logMessageData.TARGET_ID, true);
                const msg = global.textFormat({
                    Title: "🛡️  𝗔𝗡𝗧𝗜-𝗥𝗢𝗕𝗕𝗘𝗥𝗬 𝗔𝗖𝗧𝗜𝗩𝗘",
                    Description: "❌  An admin was removed without permission!\n✅  Admin restored.",
                    Footer: "⚠️  Defense Activated"
                });
                api.sendMessage(msg, threadID, (err, info) => {
                    setTimeout(() => api.unsendMessage(info.messageID), 26000);
                });
            }
        } catch {}
    }

    if (!threadData.nameWarnings) threadData.nameWarnings = {};

    if (logMessageType === "log:thread-name") {
        if (event.author === api.getCurrentUserID()) return;
        if (logMessageData.NAME !== threadData.originalName) {
            await api.setTitle(threadData.originalName, threadID);
            if (!isAdmin(event.author)) {
                if (!threadData.nameWarnings[event.author]) {
                    threadData.nameWarnings[event.author] = 1;
                } else {
                    threadData.nameWarnings[event.author]++;
                }
                saveProtectionData(protectionData);

                if (threadData.nameWarnings[event.author] >= 2) {
                    delete threadData.nameWarnings[event.author];
                    saveProtectionData(protectionData);
                    await api.removeUserFromGroup(event.author, threadID);
                    const msg = global.textFormat({
                        Title: "🛡️  𝗔𝗡𝗧𝗜-𝗥𝗢𝗕𝗕𝗘𝗥𝗬 𝗡𝗔𝗠𝗘 𝗚𝗨𝗔𝗥𝗗",
                        Description: "❌  Group name changed twice without permission!\n⏪  Name restored and user removed.",
                        Footer: "⚠️  Repeated Violation Detected"
                    });
                    api.sendMessage(msg, threadID, (err, info) => {
                        setTimeout(() => api.unsendMessage(info.messageID), 26000);
                    });
                } else {
                    const msg = global.textFormat({
                        Title: "⚠️  𝗪𝗔𝗥𝗡𝗜𝗡𝗚  𝗡𝗔𝗠𝗘 𝗚𝗨𝗔𝗥𝗗",
                        Description: `⚠️  Group name change attempt ${threadData.nameWarnings[event.author]}/2 detected!\n⏪  Name has been restored.`,
                        Footer: "Be cautious. Next attempt may result in removal."
                    });
                    api.sendMessage(msg, threadID, (err, info) => {
                        setTimeout(() => api.unsendMessage(info.messageID), 26000);
                    });
                }
            }
        }
    }

    if (logMessageType === "log:thread-image") {
        if (event.author === api.getCurrentUserID()) return;
        if (threadData.originalImage) {
            await api.changeGroupImage(fs.createReadStream(threadData.originalImage), threadID);
            if (!isAdmin(event.author)) {
                await api.removeUserFromGroup(event.author, threadID);
                const msg = global.textFormat({
                    Title: "🛡️  𝗔𝗡𝗧𝗜-𝗥𝗢𝗕𝗕𝗘𝗥𝗬 𝗣𝗜𝗖 𝗣𝗥𝗢𝗧𝗘𝗖𝗧",
                    Description: "❌  Group image changed unauthorized!\n⏪  Image restored and user kicked.",
                    Footer: "⚠️  Security Notice"
                });
                api.sendMessage(msg, threadID, (err, info) => {
                    setTimeout(() => api.unsendMessage(info.messageID), 26000);
                });
            }
        }
    }
};

module.exports = {
    handleAdminChange
};