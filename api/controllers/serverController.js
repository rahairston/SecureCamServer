'use strict';
const fs = require('fs'); //file-system handling
const { exec } = require('child_process'); //running the matlab algorithm
const path = require('path'); //OS independent pathing... not that it matters snce we're on a pi
const crypto = require('crypto');
const configPath = path.join(process.cwd(),'config');
const picturesPath = path.join(process.cwd(), 'Pictures')
let password = require(configPath);

//HTTP status codes (other than default 200)
const HTTP_NO_CONTENT = 204
const HTTP_FILE_NOT_FOUND = 404

/**
 * Promise function to return all folders
 * and files in the Pictures folder as an
 * array in the format 'folder/img'
 * @param folders list of folders in the picturesPath folder
 * @return Promise resolving an array of strings containing folders/files in the Pictures folder 
 */
function getFolders(folders) {
  return new Promise((resolve, reject) => {
    let arr = [];

    for(let i in folders) {
      const folder = folders[i];
      //check if it's a folder in case of our "snapshot" image
      if (fs.lstatSync(`${picturesPath}/${folder}`).isDirectory()) {
        const pictures = fs.readdirSync(path.join(picturesPath, folder));
        for(let j in pictures) {
          arr.push(path.join(folder, pictures[j]));
        }
      }
    }

    resolve(arr);
  });
}

/**
 * Turns on the camera by executing the python script
 * that infinitely loops to look for motion that takes 
 * pictures when motion is detected. Passes both daily
 * AND session folders as parameters to the python script
 * @param {*} req contains password
 * @param {*} res 
 * @return the daily and session folders
 */
exports.turnOn = function(req, res) {
  const today = new Date();
  const dateString = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`;
  const folder = path.join(picturesPath, dateString); //daily folder
  const session = path.join(picturesPath, 'Session'); // session folder

  //make dialy folder if one doesn't exist
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  /* always make a session folder (but still do a check because... uh...)
    * session folder is each time the camera is turned on, that way
    * We can distinguish from old photos. On client we will NOT do double
    * requests. We will just do a duaity check there (i.e., if session, don't request,
    * but if the requested picture from the date folder is a session, we'll put it under
    * the session section) -- note for when working on client)
    */
  if (!fs.existsSync(session)) {
    fs.mkdirSync(session);
  }

  //execute the python script that contains the Pi pin reading
  exec(`python ${process.cwd()}/Scripts/sensor.py ${folder}/ ${session}/ &`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  const data = {
    folder: dateString
  };

  res.send(data);
};

/**
 * Turns off motion sensor by killing the process
 * in which the infinite loops resides. The process
 * id is in a file called file.txt which is created
 * BY the python process (since it knows it's PID)
 * This also removes the Session folder and all of it's
 * contents since it is a copy of all pictures taken
 * during the 'on' phase
 * @param {*} req contains password
 * @param {*} res 
 */
exports.turnOff = function(req, res) {
  //file with the pid of our infinite loop
  const file = path.join(process.cwd(), 'Scripts', 'file.txt')

  if (fs.existsSync(file)) {    
    const pid = fs.readFileSync(file)
    if (pid !== undefined || pid !== null) {
      exec(`kill ${pid}`, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }

    fs.unlinkSync(file);
  }
  const sessionPath = path.join(picturesPath, 'Session');

  //removing the session folder and it's contents (if no session, then rm -rf does nothing)
  exec(`rm -rf ${sessionPath}`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  res.send('Successfully turned off');
};

/**
 * Gets an individual picture by name
 * Will be recieved in headers as FOLDER/'img'.jpg
 * This exists because NodeJS isn't good at 
 * sending multiple files at a time 
 * FUTURE PLANS
 * maybe switch to zip and request folder/send a folder at a time?
 * @param {*} req contains password AND picture to GET
 * @param {*} res 
 */
exports.getPicture = function(req, res) {
  //Send file doesn't allow relative paths BUT still check just in case
  if (!fs.existsSync(path.join(picturesPath, req.headers.picture)) || req.headers.picture.includes('..')) {
    res.status(HTTP_FILE_NOT_FOUND).send('File not found')
    return
  }

  res.sendFile(req.headers.picture, {root: picturesPath})
}

/**
 * Returns list of pictures so we can individually GET them (above)
 * Calls the getFolders promise function so we get all folders
 * before we send them back.
 * @param {*} req contains password
 * @param {*} res 
 * @return list of folders and files in thos folders
 */
exports.getPictures = function(req, res) {
  const folders = fs.readdirSync(picturesPath);

  getFolders(folders).then(array => {
    let data = {
      pictures: array
    };
    
    res.send(data);
  });
};

/**
 * Deletes the selected photo sent in
 * req. Can only delete items in the
 * Pictures sub-folders
 * @param {*} req contains password AND picture to delete
 * @param {*} res 
 * @return 'No content' even if nothing was deleted
 */
exports.deletePictures = function(req, res) {
    const imgPath = path.join(picturesPath, req.body.picture);

    //Check if includes picture path to prevent removing files outside of Pictures
    if (fs.existsSync(imgPath) && imgPath.includes(picturesPath)) {
      fs.unlinkSync(imgPath);
    }
  
    res.sendStatus(HTTP_NO_CONTENT);
};

/**
 * This function will be queried by the app every
 * x seconds AFTER the server is turned on to see
 * if a picture has been taken (i.e. motion detector
 * has been set off)
 * @param {*} req password
 * @param {*} res 
 * @return verification if the motion detector has been tripped or not
 */
exports.notifications = function(req, res) {
  const sessionPath = path.join(picturesPath, 'Session');

  if (fs.existsSync(sessionPath)) {
    const array = fs.readdirSync(sessionPath)

    if (array === undefined || array.length === 0) {
      res.send('No')
    } else {
      res.send('Yes')
    }
  } else {
    res.send('Camera is off')
  }
};

/**
 * Changing password for the server to turn on
 * Changes the hash in the config file as well
 * @param {*} req contains old and new passwords
 * @param {*} res 
 */
exports.newPassword = function(req, res) {
  const newUser = crypto.createHash('sha256').update(req.body.username).digest('hex');
  const newPass = crypto.createHash('sha256').update(req.body.password).digest('hex');
  const file = path.join(process.cwd(), 'config.js')
  fs.unlinkSync(file); //delete the file then overwrite it
  fs.appendFileSync(file, `'use strict'\nexports.username='${newUser}'\nexports.password='${newPass}'`);
  res.sendStatus(HTTP_NO_CONTENT);
}

/**
 * Used for a login-style screen on client. That
 * way we can get the password before any other calls.
 * This also let's us store the password on the client
 * and attach it to all future calls
 * Returns if the camera is on or off by seeing if th eprocess file exists
 * @param {*} req 
 * @param {*} res 
 */
exports.login = function(req, res) {
  res.send(fs.existsSync(path.join(process.cwd(), 'Scripts', 'file.txt')));
}

/**
 * Used to take a single snapshot image on request
 * @param {*} req 
 * @param {*} res 
 */
exports.snapshot = function(req, res) {
  //execute the python script that makes the camera take a picture
  exec(`python ${process.cwd()}/Scripts/camera.py ${picturesPath}/ `, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  res.sendFile('snapshot.jpg', {root: picturesPath});
}
