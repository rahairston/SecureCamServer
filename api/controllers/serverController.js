'use strict';
var fs = require('fs'); //file-system handling
const { exec } = require('child_process'); //running the matlab algorithm
const path = require('path'); //OS independent pathing

/**
 * 
 * @param userId the user id for folder pathing purposes
 * @param type the type of file manipulation
 * 1 is registration
 * 2 is login (if there are multiple logins, then we don't add header again)
 * 3 is removing the algorithm run file so old data is not re-run
 */
function fileHandler(userId, type) {
  var today = new Date();
  var dateString = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`;
  var folder = path.join(process.cwd(), 'users', `${userId}`);
  switch (type) {
    case 1: { //registration making folder and files
      fs.mkdirSync(folder);
      fs.appendFileSync(path.join(folder,`${dateString}.csv`), HEADER); //daily csv
      fs.appendFileSync(path.join(folder,`${dateString}-risk.txt`), ''); //daily risk
      fs.appendFileSync(path.join(folder,'algorithm.csv'), HEADER); //algorithm run csv
      break;
    } case 2: { //login making new daily file
      fs.appendFileSync(path.join(folder,`${dateString}-risk.txt`), ''); //daily risk (no if check because we don't write any header)
      if (!fs.existsSync(path.join(folder,`${dateString}.csv`))) {
        //write file header if the file doesn't exist
        fs.appendFileSync(path.join(folder,`${dateString}.csv`), HEADER);
      }
      break;
    } case 3: { //make new csv AFTER running algorithm on it
      try {
        fs.unlinkSync(path.join(folder,'algorithm.csv'));
        fs.appendFileSync(path.join(folder,'algorithm.csv'), HEADER);
      } catch (err) {
        console.log(err);
      } 
      break;
    } default:;
  }
}

exports.turnOn = function(req, res) {
  res.send('hi');
};

exports.turnOff = function(req, res) {
  res.send('hi');
};
