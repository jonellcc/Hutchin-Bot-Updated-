const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const jsonPath = path.join(__dirname, './express-data.json');

function waitUntilFileExists(filePath, interval = 1000) {
  return new Promise((resolve) => {
    const check = () => {
      if (fs.existsSync(filePath)) {
        console.log('File found!');
        resolve(true);
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}

function getData() {
  const raw = fs.readFileSync(jsonPath, 'utf8');
  return JSON.parse(raw);
}

router.get('/', async (req, res) => {
  try {
    await waitUntilFileExists(jsonPath, 1000);
    const data = getData();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

module.exports = router;
