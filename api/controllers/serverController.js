'use strict';
var fs = require('fs'); //file-system handling
const { exec } = require('child_process'); //running the matlab algorithm
const path = require('path'); //OS independent pathing... not that it matters snce we're on a pi
var crypto = require('crypto')
var configPath = path.join(process.cwd(),'config');
const password = require(configPath);

const HTTP_SUCCESS = 200
const HTTP_UNAUTHORIZED = 401

function getFolders(picturePath, folders) {
  return new Promise(function(resolve, reject) {
    var arr = [];

    for(var i in folders) {
      var folder = folders[i];
      var pictures = fs.readdirSync(path.join(picturePath, folder));
      for(var j in pictures) {
        arr.push(path.join(folder, pictures[j]));
      }
    }

    resolve(arr);
  });
}

exports.turnOn = function(req, res) {
  if (crypto.createHash('sha256').update(req.body.password).digest('hex') !== password.password) {
    res.sendStatus(HTTP_UNAUTHORIZED);
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

  res.sendStatus(HTTP_SUCCESS);
};

exports.turnOff = function(req, res) {
  if (crypto.createHash('sha256').update(req.body.password).digest('hex') !== password.password) {
    res.sendStatus(HTTP_UNAUTHORIZED);
    return;
  }

  //file with the pid of our infinite loop
  var file = path.join(process.cwd(), 'Scripts', 'file.txt')

  if (fs.existsSync(file)) {    
    var pid = fs.readFileSync(file)
    if (pid !== undefined || pid !== null) {
      exec(`kill ${pid} && rm ${file}`, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }}

  var sessionPath = path.join(process.cwd(), 'Pictures', 'Session');

  //removing the session folder and it's contents
  exec(`rm -rf ${sessionPath}/`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  res.sendStatus(HTTP_SUCCESS);
};

/**
 * Gets an individual picture by name
 * Will be recieved in headers as FOLDER/'img'.jpg
 * This exists because NodeJS isn't good at 
 * sending multiple files at a time (maybe switch to zip?)
 * @param {*} req 
 * @param {*} res 
 */
exports.getPicture = function(req, res) {
  if (crypto.createHash('sha256').update(req.headers.password).digest('hex') !== password.password) {
    res.sendStatus(HTTP_UNAUTHORIZED);
    return;
  }

  var imgPath = path.join('Pictures', req.headers.picture)

  res.sendFile(imgPath, {root: process.cwd()})
}

/**
 * Returns list of pictures so we can individually GET them (above)
 * @param {*} req 
 * @param {*} res 
 */
exports.getPictures = function(req, res) {
  if (crypto.createHash('sha256').update(req.headers.password).digest('hex') !== password.password) {
    res.sendStatus(HTTP_UNAUTHORIZED);
    return;
  }

  var picturePath = path.join(process.cwd(), 'Pictures')
  var folders = fs.readdirSync(picturePath);

  getFolders(picturePath, folders).then(function(array) {
    var data = {
      pictures: array
    };
    
    res.send(data);
  });
};

exports.deletePictures = function(req, res) {
  if (crypto.createHash('sha256').update(req.body.password).digest('hex') !== password.password) {
    res.sendStatus(HTTP_UNAUTHORIZED);
    return;
  }
};

exports.notifications = function(req, res) {
  if (crypto.createHash('sha256').update(req.headers.password).digest('hex') !== password.password) {
    res.sendStatus(HTTP_UNAUTHORIZED);
    return;
  }
};

exports.newPassword = function(req, res) {
  if (crypto.createHash('sha256').update(req.body.password).digest('hex') !== password.password) {
    res.sendStatus(HTTP_UNAUTHORIZED);
    return;
  }

  var newPass = crypto.createHash('sha256').update(req.body.newPassword).digest('hex');
  var file = path.join(process.cwd(), 'config.js')
  fs.unlinkSync(file); //delete the file then overwrite it
  fs.appendFileSync(file, `'use strict'\nexports.password='${newPass}'`);
  res.sendStatus(HTTP_SUCCESS)
}
