'use strict';

var User = require('../routes/user/endpoints');
var Auth = require('../routes/auth/endpoints');


var internals = {};

//Concatentate the routes into one array
internals.routes = [].concat(
	User.endpoints,
	Auth.endpoints
);

//Set the routes for the server
internals.init = function (server) {
	server.route(internals.routes);
};

module.exports = internals;
