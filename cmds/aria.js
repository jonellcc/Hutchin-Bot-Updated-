const axios = require('axios');
const cr = require('crypto');

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

const fontMapping = {
  'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',
  'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',
  'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',
  'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
  'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴',
  'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻',
  'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂',
  'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
  1: "𝟭", 2: "𝟮", 3: "𝟯", 4: "𝟰", 5: "𝟱", 6: "𝟲", 7: "𝟳", 8: "𝟴", 9: "𝟵", 0: "𝟬"
};

function convertToBold(text) {
  return text.replace(/(?:\*\*(.*?)\*\*|## (.*?)|### (.*?))/g, (match, boldText, h2Text, h3Text) => {
    const targetText = boldText || h2Text || h3Text;
    return [...targetText].map(char => fontMapping[char] || char).join('');
  });
}

function agent() {
  const chromeVersion = `${Math.floor(Math.random() * 6) + 130}.0.0.0`;
  const oprVersion = `${Math.floor(Math.random() * 5) + 86}.0.0.0`;
  return `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Mobile Safari/537.36 OPR/${oprVersion}`;
}

module.exports = {
  name: 'aria',
  info: 'Ask a question to Aria AI',
  usedby: 0,
  dev: 'Cliff (rest api)',
  onPrefix: true,
  dmUser: true,
  nickName: ['aria', 'ariaai'],
  usages: "<question>",
  cooldowns: 3,

  onLaunch: async function ({ event, target, message, api, actions }) {
    const prompt = target.join(' ');
    if (!prompt) {
      return actions.reply(`𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚚𝚞𝚎𝚜𝚝𝚒𝚘𝚗 𝚏𝚒𝚛𝚜𝚝`);
    }

    await api.setMessageReactionMqtt("⏱️", event.messageID, event.threadID);

    try {
      const tokenReq = new URLSearchParams({
        client_id: 'ofa',
        grant_type: 'refresh_token',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI5ODY3MTgyMTgiLCJjaWQiOiJvZmEiLCJ2ZXIiOiIyIiwiaWF0IjoxNzM1NTQ0MzAzLCJqdGkiOiJiOGRoV0Z4TTc3MTczNTU0NDMwMyJ9.EAJrJflcetOzXUdCfQve306QTe_h3Zac76XxjS5Xg1c',
        scope: 'shodan:aria user:read'
      }).toString();

      const tResponse = await axios.post('https://oauth2.opera-api.com/oauth2/v1/token/', tokenReq, {
        headers: {
          'User-Agent': agent(),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const token = tResponse.data.access_token;
      const k = cr.randomBytes(32).toString('base64');

      const rData = {
        query: prompt,
        convertational_id: event.senderID,
        stream: false,
        linkify: true,
        linkify_version: 3,
        sia: true,
        supported_commands: [],
        media_attachments: [],
        encryption: { key: k }
      };

      const r = await axios.post('https://composer.opera-api.com/api/v1/a-chat', rData, {
        headers: {
          'User-Agent': agent(),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
          'x-opera-ui-language': 'en, tl',
          'accept-language': 'en-US, tl-PH;q=0.9, *;q=0',
          'sec-ch-ua': '"OperaMobile";v="86", ";Not A Brand";v="99", "Opera";v="115", "Chromium";v="130"',
          'sec-ch-ua-mobile': '?1',
          'x-opera-timezone': '+08:00',
          origin: 'opera-aria://ui'
        }
      });

      const m = r.data.message;
      if (m.trim()) {
        await api.setMessageReactionMqtt("✅", event.messageID, event.threadID);
        const messages = splitMessageIntoChunks(convertToBold(m.trim()), 2000);
        for (const msg of messages) {
          await actions.reply(msg);
        }
      } else {
        await actions.reply('You have reached your daily request limit. Please come back tomorrow.');
      }
    } catch (err) {
      await actions.reply(err.message);
    }
  }
};