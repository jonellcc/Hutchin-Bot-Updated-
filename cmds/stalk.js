const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "stalk",
  usedby: 0,
  info: "Get FB info by reply, UID, or @mention",
  dmUser: false,
  nickName: ["info", "lookup"],
  onPrefix: true,
  cooldowns: 5,

  onLaunch: async function ({ event, target, api }) {
    const { senderID, messageReply, mentions, threadID, messageID } = event;
    let id;

    try {
      if (target.join().includes("@")) {
        id = Object.keys(mentions)[0];
      } else if (target[0]) {
        id = target[0];
      } else {
        id = senderID;
      }

      if (event.type === "message_reply") {
        id = messageReply.senderID;
      }

      console.log(`[STALK] Target UID: ${id}`);

      const userInfo = await api.getUserInfo(id, false);

      if (!userInfo) {
        console.log(`[STALK ERROR] No user info returned for UID: ${id}`);
        throw new Error("No user info found.");
      }

      const {
        name = "Unknown",
        firstName = "Unknown",
        lastName = "Unknown",
        vanity = "Unknown",
        gender = "Unknown",
        type = "Unknown",
        isFriend,
        isBirthday,
        isVerified,
        bio = "Unknown",
        live_city = "Unknown",
        headline = "Unknown",
        followers = "Unknown",
        following = "Unknown"
      } = userInfo;

      console.log(`[STALK] Retrieved info for: ${name}`);

      const url = `https://jonell01-ccprojectsapihshs.hf.space/api/stalkfb?id=${id}&name=${encodeURIComponent(name)}`;
      const res = await axios.get(url, { responseType: "arraybuffer" });

      const outputPath = path.join(__dirname, "cache", `${id}_stalk.png`);
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, Buffer.from(res.data));

      console.log(`[STALK] Image saved at: ${outputPath}`);

      const message = {
        body:
`❍━[ FACEBOOK INFO ]━❍

• Name: ${name}
• UID: ${id}
• First Name: ${firstName}
• Last Name: ${lastName}
• Vanity: ${vanity}
• Gender: ${gender}
• Verified: ${isVerified ? "Yes" : "No"}
• Friend: ${isFriend ? "Yes" : "No"}
• Birthday Today: ${isBirthday ? "Yes" : "No"}
• Type: ${type}
• Bio: ${bio}
• City: ${live_city}
• Headline: ${headline}
• Followers: ${followers}
• Following: ${following}

❍━━━━━━━━━━━━❍`,
        attachment: fs.createReadStream(outputPath)
      };

      await api.sendMessage(message, threadID, undefined, messageID);
    } catch (e) {
      console.error("[STALK ERROR] An error occurred:");
      console.error(e.stack || e);

      try {
        const fallbackPath = path.join(__dirname, "cache", `${id}_stalk.png`);
        if (await fs.pathExists(fallbackPath)) {
          await api.sendMessage({
            body: "❌ Failed to load some user data, but here is the profile image:",
            attachment: fs.createReadStream(fallbackPath)
          }, threadID, undefined, messageID);
        } else {
          await api.sendMessage("❌ Failed to retrieve user info and no image was generated.", threadID, undefined, messageID);
        }
      } catch (sendErr) {
        console.error("[STALK ERROR] Failed to send fallback message:");
        console.error(sendErr.stack || sendErr);
      }
    }
  }
};