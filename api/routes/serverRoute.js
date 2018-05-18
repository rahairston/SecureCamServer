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
};
