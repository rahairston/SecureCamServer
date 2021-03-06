'use strict';
const path = require('path');
module.exports = function(app) {
  var controllerPath = path.join('..', 'controllers', 'serverController');
  var camera = require(controllerPath);

  // Routes
  app.route('/camera')
  	.post(camera.turnOnOrOff);

  app.route('/picture/:picture')
    .get(camera.getPicture);

  app.route('/pictures')
    .get(camera.getPictures);

  app.route('/remove')
    .delete(camera.deletePictures);

  app.route('/notify')
    .get(camera.notifications);

  app.route('/password')
    .post(camera.newPassword);

  app.route('/login')
    .get(camera.login);

  app.route('/snapshot')
    .get(camera.snapshot);
};
