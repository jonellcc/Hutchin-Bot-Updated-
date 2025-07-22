const fs = require("fs");
const FILE = "cmds/database/nsfw.json";

if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({}, null, 2));
}

const load = () => JSON.parse(fs.readFileSync(FILE, "utf8"));
const save = (data) => fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

const nsfwUtils = (threadID, mode) => {
    const db = load();

    if (!threadID) {
        return global.textFormat({
            Title: "**Missing Thread ID**",
            Description: "Thread ID is required.",
            Footer: "NSFW Mode Handler"
        });
    }

    if (mode === "stats") {
        const isEnabled = db[threadID] ?? false;
        return global.textFormat({
            Title: "**NSFW Mode Status**",
            Description: `NSFW mode is currently ${isEnabled ? "ENABLED" : "DISABLED"} for this thread.`,
            Footer: "NSFW Mode Checker"
        });
    }

    if (typeof mode !== "boolean" && mode !== "stats") {
        return global.textFormat({
            Title: "**Invalid Mode**",
            Description: "NSFW mode must be `true`, `false`, or `'stats'`.",
            Footer: "NSFW Mode Handler"
        });
    }

    if (mode === "stats") {
        return global.textFormat({
            Title: "**NSFW Mode Status**",
            Description: `NSFW mode is currently ${db[threadID] ? "ENABLED" : "DISABLED"} for this thread.`,
            Footer: "NSFW Mode Status"
        });
    }

    db[threadID] = mode;
    save(db);

    return global.textFormat({
        Title: `**NSFW Mode ${mode ? "Enabled" : "Disabled"}**`,
        Description: `NSFW content is now ${mode ? "allowed" : "blocked"} in this thread.`,
        Footer: "NSFW Mode Handler"
    });
};

module.exports = nsfwUtils;