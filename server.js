const path = require('path');

var routePath = path.join(process.cwd(),'api','routes','serverRoute');

var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;
  SALT_WORK_FACTOR = 10,
bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.raw({limit: '50mb'}));

var routes = require(routePath); //importing route
routes(app); //register the route

app.listen(port);

console.log('RESTful API server started on: ' + port);
