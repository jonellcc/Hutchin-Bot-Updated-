/*  
 * == Default Express Template ==  
 *  
 * Created with care by: @ChoruOfficial (John Steve Costaños)  
 *  
 * This template offers a solid and straightforward foundation.  
 * It's designed to be a versatile starting point,  
 * ready for you to build upon and customize for your projects.  
 *  
 * #Btw this template is default only  
 * NOTE: Port is fixed. Changing the port is NOT allowed.  
 */
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
