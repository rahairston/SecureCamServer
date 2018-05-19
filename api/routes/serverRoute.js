'use strict';
const path = require('path');
module.exports = function(app) {
  var controllerPath = path.join('..', 'controllers', 'serverController');
  var camera = require(controllerPath);

  // Routes
  app.route('/on')
  	.post(camera.turnOn);

  app.route('/off')
    .post(camera.turnOff);

  app.route('/pictures')
    .get(camera.getPictures);

  app.route('/remove')
    .delete(camera.deletePictures);

  app.route('/notify')
    .get(camera.notifications);

  app.route('/password')
    .post(camera.newPassword);
};
