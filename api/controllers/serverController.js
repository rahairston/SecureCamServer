'use strict';
var fs = require('fs'); //file-system handling
const { exec } = require('child_process'); //running the matlab algorithm
const path = require('path'); //OS independent pathing

exports.turnOn = function(req, res) {
  var today = new Date();
  var dateString = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`;
  var folder = path.join(process.cwd(), 'Pictures', dateString);

  //make dialy folder if one doesn't exist
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  res.send('hi');
};

exports.turnOff = function(req, res) {
  res.send('hi');
};

exports.getPictures = function(req, res) {

};

exports.notifications = function(req, res) {

};
