const { spawn } = require("child_process");
const express = require("express");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const port = 5055;
const appstatePath = "appstate.json";
const passcodePath = "pass.json";

let childProcess;
const clients = new Set();
const automaticRestart = true;
let isFrozen = false;

app.use(express.static("public"));
app.use(express.json());

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.post("/update-appstate", (req, res) => {
    const { passcode, jsonData } = req.body;
    if (!isValidPasscode(passcode)) {
        return res.status(401).send("Wrong passcode");
    }
    fs.writeFile(appstatePath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
            return res.status(500).send("Failed to update appstate.json");
        }
        startBot();
        res.send("Successfully restarted.");
    });
});

app.get("/restart", (req, res) => {
    const passcode = req.query.passcode;
    if (!isValidPasscode(passcode)) {
        return res.status(401).send("Wrong passcode");
    }
    startBot();
    res.send("Successfully restarted.");
});

app.post("/execute-command", (req, res) => {
    const { passcode, command } = req.body;
    if (!isValidPasscode(passcode)) {
        return res.status(401).send("Wrong passcode");
    }
    if (!command) {
        return res.status(400).send("Command is required.");
    }
    const execProcess = spawn(command, { shell: true, stdio: 'pipe' });
    let output = '';
    execProcess.stdout.on('data', (data) => {
        output += data.toString();
    });
    execProcess.stderr.on('data', (data) => {
        output += data.toString();
    });
    execProcess.on('close', (code) => {
        if (code === 0) {
            res.send(`Command executed successfully: ${output}`);
        } else {
            res.status(500).send(`Command execution failed with exit code ${code}: ${output}`);
        }
    });
});

app.get("/ping", (req, res) => {
    res.json({ ping: Math.floor(Math.random() * 100) + 10 });
});

app.get("/api/script", (req, res) => {
    const { q, passcode } = req.query;
    if (!isValidPasscode(passcode)) {
        return res.status(401).send("Wrong passcode");
    }
    if (q === "yes") {
        res.send("Restarting script...");
        isFrozen = false;
        startBot();
    } else if (q === "no") {
        res.send("Main.js will be frozen. Waiting for developer to re-execute.");
        freezeBot();
    } else {
        res.status(400).send("Invalid query. Use q=yes or q=no.");
    }
});

function startBot() {
    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "main.js && git.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (codeExit) => {
        console.log(`Bot process exited with code: ${codeExit}`);
        if (codeExit !== 0) {
            setTimeout(startBot, 3000);
        }
    });

    child.on("error", (error) => {
        console.error(`An error occurred starting the bot: ${error}`);
    });
}

function freezeBot() {
    console.log("Main.js is frozen. Waiting for developer to re-execute the script!!");
    isFrozen = true;
    setInterval(() => {}, 1 << 30); // Keeps the process alive but does nothing
}

function isValidPasscode(inputPasscode) {
    try {
        const passData = JSON.parse(fs.readFileSync(passcodePath, "utf8"));
        return inputPasscode === passData.passcode;
    } catch {
        return false;
    }
}

const server = app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
    startBot();
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => {
        clients.delete(ws);
    });
});