/*
@JohnSteveCostaños as known @ChoruOfficial
#Btw this template is default only 
*/

const express = require('express');
const app = express(); // Ito 'yung 'app' instance na ipapasa natin
const PORT = 3000;
const saveDetectedRoutes = require('./pathsRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.send('Exocore Server Root - Updated!');
});

app.on('error', (error) => {
  console.error('[Server] Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`[Love Server] Port ${PORT} is already in use.`);
    process.exit(1);
  }
});
