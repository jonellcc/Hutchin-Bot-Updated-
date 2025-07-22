function textFormat(data) {
    const makeBold = (text) => text.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
        const map = {
            a: '𝗮', b: '𝗯', c: '𝗰', d: '𝗱', e: '𝗲', f: '𝗳', g: '𝗴',
            h: '𝗵', i: '𝗶', j: '𝗷', k: '𝗸', l: '𝗹', m: '𝗺', n: '𝗻',
            o: '𝗼', p: '𝗽', q: '𝗾', r: '𝗿', s: '𝘀', t: '𝘁', u: '𝘂',
            v: '𝘃', w: '𝘄', x: '𝘅', y: '𝘆', z: '𝘇',
            A: '𝗔', B: '𝗕', C: '𝗖', D: '𝗗', E: '𝗘', F: '𝗙', G: '𝗚',
            H: '𝗛', I: '𝗜', J: '𝗝', K: '𝗞', L: '𝗟', M: '𝗠', N: '𝗡',
            O: '𝗢', P: '𝗣', Q: '𝗤', R: '𝗥', S: '𝗦', T: '𝗧', U: '𝗨',
            V: '𝗩', W: '𝗪', X: '𝗫', Y: '𝗬', Z: '𝗭'
        };
        return p1.split('').map(c => map[c] || c).join('');
    });

    const title = data.Title ? makeBold(data.Title) : '𝗧𝗶𝘁𝗹𝗲';
    const description = data.Description ? makeBold(data.Description) : '';
    const footer = data.Footer ? makeBold(data.Footer) : '𝗙𝗼𝗼𝘁𝗲𝗿';

    return `${title}\n━━━━━━━━━━━━━━━━━━\n${description}\n━━━━━━━━━━━━━━━━━━\n${footer}`;
}

module.exports = textFormat;