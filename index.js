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
 */

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Exocore Server Root - Updated!');
});

app.on('error', (error) => {
  console.error('[Server] Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`[Server] Port ${PORT} is already in use. Attempting to use a different port or exiting.`);
    process.exit(1);
  }
});

app.listen(PORT, () => {
  console.log(`[Server] Exocore Server is running on http://localhost:${PORT}`);
}).on('error', (error) => {
  console.error('[Server] Failed to start server:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`[Server] Port ${PORT} is already in use.`);
  }
  process.exit(1);
});
