const cron = require('node-cron');
const fs = require('fs');
const axios = require('axios');

const STORY_FILE = 'story.txt';
let autoStoryEnabled = false;
let globalApi = null;

if (fs.existsSync(STORY_FILE)) {
  autoStoryEnabled = fs.readFileSync(STORY_FILE, 'utf8') === 'true';
}

const backgrounds = ['blue', 'modern', 'green', 'orange'];
const fonts = ['classic', 'casual', 'bold', 'elegant'];

module.exports = {
  name: "story",
  onPrefix: true,
  info: "Manage Facebook Stories (create/reply/react/auto)",
  dev: "Jonell Magallanes",
  usedby: 0,
  cooldowns: 50,

  onLaunch: async function ({ api, event, target }) {
    globalApi = api; // Store the api reference
    
    if (target.length === 0) {
      return api.sendMessage("❗ Usage:\n/story create <text> | <font> | <bg>\n/story reply <url_or_id> <message>\n/story react <url_or_id> <emoji>\n/story auto on|off", event.threadID);
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
        if (args.length < 2) return api.sendMessage("❗ Usage: /story reply <url_or_id> <message>", event.threadID);
        const [storyIdOrUrl, ...msgArr] = args;
        const message = msgArr.join(" ").trim();
        const res = await api.story.msg(storyIdOrUrl, message);
        if (res?.success) return api.sendMessage("✅ Successfully replied to the story!", event.threadID);
        else return api.sendMessage(`❌ Failed to reply.\n${res?.error || "Unknown error."}`, event.threadID);
      }
      else if (action === "react") {
        if (args.length !== 2) return api.sendMessage("❗ Usage: /story react <url_or_id> <emoji>", event.threadID);
        const [storyIdOrUrl, emoji] = args;
        const res = await api.story.react(storyIdOrUrl, emoji);
        if (res?.success) return api.sendMessage(`✅ Reacted to story with: ${emoji}`, event.threadID);
        else return api.sendMessage(`❌ Failed to react.\n${res?.error || "Unknown error."}`, event.threadID);
      }
      else if (action === "auto") {
        const subAction = args[0]?.toLowerCase();
        if (!subAction || !["on", "off"].includes(subAction)) {
          return api.sendMessage("❗ Usage: /story auto on|off", event.threadID);
        }

        if (subAction === "on") {
          if (autoStoryEnabled) return api.sendMessage("❌ Auto-story is already active globally.", event.threadID);
          autoStoryEnabled = true;
          fs.writeFileSync(STORY_FILE, 'true');
          return api.sendMessage("✅ Auto-story posting activated globally! (Every 4 hours)", event.threadID);
        } else {
          autoStoryEnabled = false;
          fs.writeFileSync(STORY_FILE, 'false');
          return api.sendMessage("✅ Auto-story posting deactivated globally.", event.threadID);
        }
      }
      else {
        return api.sendMessage("❗ Invalid action. Use one of: create, reply, react, auto", event.threadID);
      }
    } catch (err) {
      return api.sendMessage(`❌ Exception: ${err.message}`, event.threadID);
    }
  },

  noPrefix: async function ({ api, event }) {
    if (!autoStoryEnabled) return;

    try {
      const quoteResponse = await axios.get('https://zenquotes.io/api/random');
      const quote = quoteResponse.data[0].q;
      const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
      const randomFont = fonts[Math.floor(Math.random() * fonts.length)];

      const storyContent = `Note for Today\n\n${quote}`;
      await api.story.create(storyContent, randomFont, randomBg);
    } catch (error) {
      console.error('Auto-story error:', error);
    }
  }
};

// Scheduled task to run every 4 hours (at minute 0 of every 4th hour)
cron.schedule('0 */4 * * *', async () => {
  if (!autoStoryEnabled || !globalApi) return;

  try {
    const quoteResponse = await axios.get('https://zenquotes.io/api/random');
    const quote = quoteResponse.data[0].q;
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const randomFont = fonts[Math.floor(Math.random() * fonts.length)];

    const storyContent = `Note for Today\n\n${quote}`;
    await globalApi.story.create(storyContent, randomFont, randomBg);
    console.log(`[Auto-Story] Posted at ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error('Scheduled story error:', error);
  }
});