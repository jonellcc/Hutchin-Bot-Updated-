module.exports = {
  name: "reactstories",
  onPrefix: true,
  info: "React to a Facebook story using a URL and emoji",
  dev: "Jonell Magallanes",
  usedby: 2,
  cooldowns: 10,

  onLaunch: async function ({ api, event, target }) {
    const input = target.join(" ").split("|");
    if (input.length < 2) return api.sendMessage("Usage: /reactstories <story URL> | <emoji>", event.threadID);

    const url = input[0].trim();
    const reaction = input[1].trim();
    const allowedEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

    if (!allowedEmojis.includes(reaction)) {
      return api.sendMessage("Invalid reaction. Allowed: 👍 ❤️ 😂 😮 😢 😡", event.threadID);
    }

    const storyIDMatch = url.match(/(?:story_fbid=|stories\/)(\d{10,})/);
    const storyID = storyIDMatch ? storyIDMatch[1] : null;

    if (!storyID) {
      return api.sendMessage("Invalid story URL.", event.threadID);
    }

    const result = await api.storiesReact(storyID, reaction);
    if (result.success) {
      api.sendMessage(`Successfully reacted to story with ${reaction}`, event.threadID);
    } else {
      api.sendMessage(`Failed to react: ${result.error}`, event.threadID);
    }
  }
};