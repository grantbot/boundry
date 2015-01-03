var express = require('express');
var routeHandler = express.Router();
var path = require('path');


var mobileApiRouter = require('./routes/mobile/mobileApiRouter');
var webApiRouter = require('./routes/web/webApiRouter');

//serve signup page as default
routeHandler.get('/', function(req, res) {
  res.sendFile(path.resolve(__dirname + '/../client/signup.html'));
});

//serve all static files
routeHandler.use(express.static(__dirname + './../client'));

routeHandler.use('/api/mobile', mobileApiRouter);
routeHandler.use('/api/web', webApiRouter);

// webRouter.post('/signup', authRouter.checkSignup);
// webRouter.post('/login', authRouter.checkLogin);

module.exports = routeHandler;
