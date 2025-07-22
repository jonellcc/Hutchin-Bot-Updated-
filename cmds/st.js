module.exports = {
  name: "story",
  onPrefix: true,
  info: "Manage Facebook Stories (create/reply/react)",
  dev: "Jonell Magallanes",
  usedby: 0,
  cooldowns: 50,

  onLaunch: async function ({ api, event, target }) {
    if (target.length === 0) {
      return api.sendMessage("❗ Usage:\n/story create <text> | <font> | <bg>\n/story reply <url_or_id> <message>\n/story react <url_or_id> <emoji>", event.threadID);
    }

    const action = target[0].toLowerCase();
    const args = target.slice(1);

    try {
      if (action === "create") {
        const fullInput = args.join(" ");
        const parts = fullInput.split("|").map(x => x.trim());

        const message = parts[0];
        const font = parts[1] || "classic";
        const background = parts[2] || "blue";

        if (!message) return api.sendMessage("❗ Missing story text.", event.threadID);

        const res = await api.story.create(message, font, background);
        if (res?.success) {
          return api.sendMessage(`✅ Story posted!\n\n📝 Text: ${message}\n🔤 Font: ${font}\n🎨 Background: ${background}`, event.threadID);
        } else {
          return api.sendMessage(`❌ Failed to post story.\n${res?.error || "Unknown error."}`, event.threadID);
        }
      }

      else if (action === "reply") {
        if (args.length < 2) {
          return api.sendMessage("❗ Usage: /story reply <url_or_id> <message>", event.threadID);
        }

        const [storyIdOrUrl, ...msgArr] = args;
        const message = msgArr.join(" ").trim();

        const res = await api.story.msg(storyIdOrUrl, message);
        if (res?.success) {
          return api.sendMessage("✅ Successfully replied to the story!", event.threadID);
        } else {
          return api.sendMessage(`❌ Failed to reply.\n${res?.error || "Unknown error."}`, event.threadID);
        }
      }

      else if (action === "react") {
        if (args.length !== 2) {
          return api.sendMessage("❗ Usage: /story react <url_or_id> <emoji>", event.threadID);
        }

        const [storyIdOrUrl, emoji] = args;

        const res = await api.story.react(storyIdOrUrl, emoji);
        if (res?.success) {
          return api.sendMessage(`✅ Reacted to story with: ${emoji}`, event.threadID);
        } else {
          return api.sendMessage(`❌ Failed to react.\n${res?.error || "Unknown error."}`, event.threadID);
        }
      }

      else {
        return api.sendMessage("❗ Invalid action. Use one of: create, reply, react", event.threadID);
      }

    } catch (err) {
      return api.sendMessage(`❌ Exception: ${err.message}`, event.threadID);
    }
  }
};