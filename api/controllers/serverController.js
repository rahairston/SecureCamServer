'use strict';
var fs = require('fs'); //file-system handling
const { exec } = require('child_process'); //running the matlab algorithm
const path = require('path'); //OS independent pathing... not that it matters snce we're on a pi
var crypto = require('crypto')
var configPath = path.join(process.cwd(),'config');
const password = require(configPath);

const HTTP_SUCCESS = 200
const HTTP_UNAUTHORIZED = 401

exports.turnOn = function(req, res) {
  if (crypto.createHash('sha256').update(req.body.password).digest('hex') !== password.password) {
    res.send(HTTP_UNAUTHORIZED);
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

  res.send(HTTP_SUCCESS);
};

exports.turnOff = function(req, res) {
  if (crypto.createHash('sha256').update(req.body.password).digest('hex') !== password.password) {
    res.send(HTTP_UNAUTHORIZED);
    return;
  }

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

  res.send(HTTP_SUCCESS);
};

exports.getPictures = function(req, res) {
  if (crypto.createHash('sha256').update(req.headers.password).digest('hex') !== password.password) {
    res.send(HTTP_UNAUTHORIZED);
    return;
  }
};

exports.deletePictures = function(req, res) {
  if (crypto.createHash('sha256').update(req.body.password).digest('hex') !== password.password) {
    res.send(HTTP_UNAUTHORIZED);
    return;
  }
};

exports.notifications = function(req, res) {
  if (crypto.createHash('sha256').update(req.headers.password).digest('hex') !== password.password) {
    res.send(HTTP_UNAUTHORIZED);
    return;
  }
};

exports.newPassword = function(req, res) {
  if (crypto.createHash('sha256').update(req.body.password).digest('hex') !== password.password) {
    res.send(HTTP_UNAUTHORIZED);
    return;
  }

  var newPass = crypto.createHash('sha256').update(req.body.newPassword).digest('hex');
  var file = path.join(process.cwd(), 'config.js')
  fs.unlinkSync(file); //delete the file then overwrite it
  fs.appendFileSync(file, `'use strict'\nexports.password='${newPass}'`);
  res.send(HTTP_SUCCESS)
}
