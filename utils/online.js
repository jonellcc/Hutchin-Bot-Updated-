const fs = require('fs');
const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const ACTIONS = [
    'https://www.facebook.com/me',
    'https://www.facebook.com/notifications',
    'https://www.facebook.com/messages'
];

const getRandomAction = () => ACTIONS[Math.floor(Math.random() * ACTIONS.length)];

const facebookHeaders = {
    'authority': 'www.facebook.com',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'max-age=0',
    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Linux; Android 13; 22127RK46C Build/TKQ1.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/107.0.5304.141 Mobile Safari/537.36 XWEB/5127 MMWEBSDK/20230604 MMWEBID/7189 MicroMessenger/8.0.38.2400(0x28002639) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 qcloudcdn-xinan Request-Source=4 Request-Channel',
    'viewport-width': '1920',
    'referer': 'https://www.facebook.com/',
    'dnt': '1'
};

function createSession() {
    try {
        const appState = JSON.parse(fs.readFileSync('./appstate.json', 'utf8'));
        const cookieJar = new CookieJar();
        
        appState.forEach(cookie => {
            cookieJar.setCookieSync(`${cookie.key}=${cookie.value}`, 'https://www.facebook.com');
        });

        return wrapper(axios.create({
            jar: cookieJar,
            withCredentials: true,
            headers: facebookHeaders
        }));
    } catch (error) {
        console.error('Session creation failed:', error.message);
        return null;
    }
}

async function simulateActivity(session) {
    if (!session) return false;

    try {
        const action = getRandomAction();
        const response = await session.get(action, {
            headers: {
                ...facebookHeaders,
                'referer': 'https://www.facebook.com/'
            }
        });

        if (response.status === 200) {
            /*console.log(`[${new Date().toLocaleTimeString()}] Success: ${action}`);*/
            return true;
        }
        return false;
    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] Error:`, error.message);
        return false;
    }
}

function startOnlinePresence() {
    const session = createSession();
    if (!session) {
        console.error('Failed to initialize session');
        return { stop: () => {} };
    }

    console.log('Starting online presence simulation...');
    
    const interval = setInterval(async () => {
        await simulateActivity(session);
    }, 45000 + Math.random() * 30000); // Random interval between 45-75 seconds

    // Initial activity
    simulateActivity(session);

    return {
        stop: () => {
            clearInterval(interval);
            console.log('Online presence stopped');
        }
    };
}

module.exports = startOnlinePresence;