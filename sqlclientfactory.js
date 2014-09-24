var config = require('./config');
var redisHandler = require('./redishandler');
var mongodbHandler = require('./mongodbhandler');
var postgisHandler = require('./postgishandler');

exports.createClient = function(name){
    switch (true){
        case (name === config.REDIS): return redisHandler.create(); // redis
        case (name === config.MONGODB): return mongodbHandler.create(); // mongodb
        case (name === config.POSTGIS): return postgisHandler.create(); // postgis
        default : return;
    }
};