const express = require('express');
const path = require('path'); 
const generateAndSaveRoutes = require('./pathsRoutes.js');

const app = express();

app.use(express.json()); 
app.get('/home', (req, res) => {
  res.send('Welcome to the Homepage!');
});

  try {
    generateAndSaveRoutes(app);
  } catch (e) {
    console.error("Error calling generateAndSaveRoutes:", e);
  }


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port http://localhost:${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log('Route generation script was called (if no errors above). Check for routes.json.');
  }
});
