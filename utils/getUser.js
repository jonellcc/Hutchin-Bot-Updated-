const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const DB_PATH = path.join(__dirname, './database/getUsers.json');

if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '{}');
}

const cleanString = (str) => {
    if (!str) return null;
    let cleaned = str.replace(/\\u([\dA-Fa-f]{4})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));
    return cleaned.replace(/[^\x00-\x7F]/g, '').trim();
};

const getUser = async (id) => {
    try {
        const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        if (db[id] && db[id].lastUpdated > Date.now() - 86400000) {
            return db[id].data;
        }

        const appState = JSON.parse(fs.readFileSync('./appstate.json', 'utf8'));
        const cookieJar = new CookieJar();
        appState.forEach(cookie => {
            cookieJar.setCookieSync(`${cookie.key}=${cookie.value}`, 'https://www.facebook.com');
        });

        const axiosInstance = wrapper(axios.create({
            jar: cookieJar,
            withCredentials: true,
        }));

        const response = await axiosInstance.get(`https://www.facebook.com/${id}`, {
            headers: {
                'authority': 'www.facebook.com',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'accept-language': 'en-US,en;q=0.9',
                'cache-control': 'no-cache',
                'cookie': appState.map(c => `${c.key}=${c.value}`).join('; '),
                'pragma': 'no-cache',
                'referer': 'https://www.facebook.com/',
                'sec-ch-ua': '"Chromium";v="123", "Not:A-Brand";v="8"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            }
        });

        const data = response.data;
        const result = {
            name: cleanString(data.match(/__isProfile":"User","name":"([^"]+)/)?.[1]),
            userId: data.match(/"id":"(\d+)"/)?.[1] || id,
            profilePicture: data.match(/profile_picture_for_sticky_bar":{"uri":"([^"]+)/)?.[1]?.replace(/\\\//g, '/'),
            gender: cleanString(data.match(/"gender":"([^"]+)/)?.[1]),
            coverPhoto: data.match(/"cover_photo":{[^}]+"photo":{"id":"(\d+)","image":{"uri":"([^"]+)/) ? {
                id: data.match(/"cover_photo":{[^}]+"photo":{"id":"(\d+)","image":{"uri":"([^"]+)/)[1],
                uri: data.match(/"cover_photo":{[^}]+"photo":{"id":"(\d+)","image":{"uri":"([^"]+)/)[2]?.replace(/\\\//g, '/')
            } : null
        };

        Object.keys(result).forEach(key => {
            if (result[key] === null || result[key] === undefined) {
                delete result[key];
            }
        });

        db[id] = {
            data: result,
            lastUpdated: Date.now()
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        return result;
    } catch (err) {
        console.error('Error:', err.message);
        return {
            error: true,
            message: err.message
        };
    }
};

if (typeof global !== 'undefined') {
    global.getUser = getUser;
}

module.exports = getUser;