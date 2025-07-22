module.exports = {
  name: 'eval',
  nickName: ['eval'],
  info: 'Evaluate JavaScript code',
  onPrefix: true,
  usedby: 4,
  dmUser: true,
  usages: '<code>',
  cooldowns: 2,

  onLaunch: async function ({ api, actions, event, target }) {
    const code = target.join(' ');
    if (!code) return;

    try {
      let result = await eval(code);
      if (typeof result !== 'string') result = require('util').inspect(result);
      if (!result) return;
      if (result.length > 1900) result = result.slice(0, 1900) + '...';
      return result;
    } catch (err) {
      return err.message;
    }
  }
};