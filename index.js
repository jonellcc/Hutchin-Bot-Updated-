/*
@JohnSteveCostaños as known @ChoruOfficial
#Btw this template is default only 
*/

const fs = require('fs');
const data = { data: 'HELLO WORLDS' };
fs.writeFileSync('./express-data.json', JSON.stringify(data, null, 2));

