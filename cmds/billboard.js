module.exports = {
    name: "biliboard",
    info: "Creates a custom comment on a billboard image",
    dev: "John Lester",
    onPrefix: true,
    dmUser: false,
    nickName: ["billboard", "board"],
    usages: "[text]",
    cooldowns: 5,
    dependencies: {
        "canvas": "",
        "axios": "",
        "fs-extra": ""
    },

    wrapText: function(ctx, text, maxWidth) {
        return new Promise(resolve => {
            if (ctx.measureText(text).width < maxWidth) return resolve([text]);
            if (ctx.measureText('W').width > maxWidth) return resolve(null);
            const words = text.split(' ');
            const lines = [];
            let line = '';
            while (words.length > 0) {
                let split = false;
                while (ctx.measureText(words[0]).width >= maxWidth) {
                    const temp = words[0];
                    words[0] = temp.slice(0, -1);
                    if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
                    else {
                        split = true;
                        words.splice(1, 0, temp.slice(-1));
                    }
                }
                if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
                else {
                    lines.push(line.trim());
                    line = '';
                }
                if (words.length === 0) lines.push(line.trim());
            }
            return resolve(lines);
        });
    },

    onLaunch: async function({ api, event, target, actions }) {
        const { loadImage, createCanvas } = require("canvas");
        const fs = require("fs-extra");
        const axios = require("axios");
        
        let pathImg = __dirname + '/cache/fact.jpg';
        let text = target.join(" ");

        if (!text) return actions.reply("Enter the content of the comment on the board");

        try {
            let getPorn = (await axios.get(`https://files.catbox.moe/0mspvz.jpeg`, { responseType: 'arraybuffer' })).data;
            fs.writeFileSync(pathImg, Buffer.from(getPorn, 'utf-8'));
            let baseImage = await loadImage(pathImg);
            let canvas = createCanvas(baseImage.width, baseImage.height);
            let ctx = canvas.getContext("2d");
            ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
            ctx.font = "bold 400 30px Arial";
            ctx.fillStyle = "#000000";
            ctx.textAlign = "center";
            let fontSize = 70;
            while (ctx.measureText(text).width > 3800) {
                fontSize--;
                ctx.font = `bold 400 ${fontSize}px Arial`;
            }
            const lines = await this.wrapText(ctx, text, 500);
            ctx.fillText(lines.join('\n'), 330, 100);
            ctx.beginPath();
            const imageBuffer = canvas.toBuffer();
            fs.writeFileSync(pathImg, imageBuffer);
            await actions.reply({ attachment: fs.createReadStream(pathImg) });
            fs.unlinkSync(pathImg);
        } catch (error) {
            console.error(error);
            actions.reply("An error occurred while processing the image.");
        }
    }
};