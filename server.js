const path = require('path');
const basicAuth = require('express-basic-auth')
const crypto = require('crypto');
const configPath = path.join(process.cwd(),'config');
const config = require(configPath);

function authorization(username, password) {
  console.log(username, password)
  const userMatches = basicAuth.safeCompare(crypto.createHash('sha256').update(username).digest('hex'), config.username)
  const passwordMatches = basicAuth.safeCompare(crypto.createHash('sha256').update(password).digest('hex'), config.password)

  return userMatches && passwordMatches
}

let routePath = path.join(process.cwd(),'api','routes','serverRoute');

let express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;
bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(basicAuth( { authorizer: authorization } ))

let routes = require(routePath); //importing route
routes(app); //register the route

app.listen(port);

console.log('RESTful API server started on: ' + port);
