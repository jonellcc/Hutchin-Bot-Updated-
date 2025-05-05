/*
@JohnSteveCostaños as known @ChoruOfficial
#* Btw this template is default only *#
#* You can add your own template, but it must be well-made so that you can add us to the exocore organization. We are available on Facebook. *#
#* You are not allowed to use express package nodejs here instead use const { app } = require("../exocore-web") *#
#* Reminder, change the package.json, replace your name in the author and you can also change the package name. *#
*/

const chalk = require('chalk');
const logo = (name) => {
  const art = `
          _                       
    /\\   | |                      
   /  \\  | | __ _ _   _  ___ _ __ 
  / /\\ \\ | |/ _\` | | | |/ _ \\ '__|
 / ____ \\| | (_| | |_| |  __/ |   
/_/    \\_\\_|\\__,_|\\__, |\\___|_|   
                   __/ |         
                  |___/         

       [ ${name} Project Started ]
  `;
  console.log(chalk.cyan(art));
};

logo("Ayaka");
