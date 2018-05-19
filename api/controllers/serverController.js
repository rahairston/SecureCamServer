'use strict';
var fs = require('fs'); //file-system handling
const { exec } = require('child_process'); //running the matlab algorithm
const path = require('path'); //OS independent pathing... not that it matters snce we're on a pi
var configPath = path.join(process.cwd(),'config');
const password = require(configPath);

exports.turnOn = function(req, res) {
  if (req.body.password !== password.password) {
    res.send('Incorrect Password');
    return;
  }
  var today = new Date();
  var dateString = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`;
  var folder = path.join(process.cwd(), 'Pictures', dateString);
  var session = path.join(process.cwd(), 'Pictures', 'Session');

  //make dialy folder if one doesn't exist
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  if (!fs.existsSync(session)) {
    fs.mkdirSync(session);
  }

  exec(`python ${process.cwd()}/scripts/sensor.py ${folder}/ ${session}/ &`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  res.send('hi');
};

exports.turnOff = function(req, res) {
  //file with the pid of our infinite loop
  var file = path.join(process.cwd(), 'Scripts', 'file.txt')

  var pid = fs.readFileSync(file)
  if (pid !== undefined || pid !== null) {
    exec(`kill ${pid} && rm ${file}`, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  }

  res.send('complete');
};

exports.getPictures = function(req, res) {

};

exports.notifications = function(req, res) {

};
