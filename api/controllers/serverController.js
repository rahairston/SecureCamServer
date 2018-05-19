'use strict';
var fs = require('fs'); //file-system handling
const { exec } = require('child_process'); //running the matlab algorithm
const path = require('path'); //OS independent pathing
var configPath = path.join(process.cwd(),'config');
const password = require(configPath);

exports.turnOn = function(req, res) {
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

  console.log(folder);

  exec(`python ${process.cwd()}/scripts/sensor.py ${folder} &`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(stderr);
  });

  res.send('hi');
};

exports.turnOff = function(req, res) {
  res.send('hi');
};

exports.getPictures = function(req, res) {

};

exports.notifications = function(req, res) {

};
