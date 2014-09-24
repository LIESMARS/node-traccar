var debug = console.log;
var config = require('./config');
var utility = require('./utility');
var redis = require(config.REDIS);
var redisClient;


var object = {
    storeImei: function (callback, options) {
        redisClient.exists(options.key.toLowerCase(), function (err, reply) {
            if (err) debug(err);
            if (reply === 0)
                redisClient.setbit(options.key.toLowerCase(), config.REDIS_DBLENGTH * 8, 1, function (err, reply) {
                    if (err) debug(err);
                    redisClient.expire(options.key.toLowerCase(), config.ONEDAYTIME * config.REDIS_DBEXPIRE / 1000, redisClient.print);
                    var name = options.key.split(':')[0].split('@').length > 1 ? options.key.split(':')[0].split('@')[0] : config.NULLNAME;
                    redisClient.hset(config.TABLE_DEVICENAME, options.key.split(':')[0].toLowerCase(), name, redisClient.print);
                });
        });
    },


    storePosition: function (callback, options) {
        if (!options.key) return;
        var gprmc = options.gprmc[1].split(',');
        if (gprmc[2] !== config.NULLPOSITION && gprmc[4] !== config.NULLPOSITION) {
            var str = utility.dbrecordfomat(gprmc);
            var index = utility.dbstoreindex();

            if (options.key === undefined) return;
            if (options.key.split(':')[1] !== utility.date()) {
                options.key = options.key.split(':')[0] + ':' + utility.date();
                redisClient.setbit(options.key.toLowerCase(), config.REDIS_DBLENGTH * 8, 1, function (err, reply) {
                    if (err) debug(err);
                    redisClient.expire(options.key.toLowerCase(), config.ONEDAYTIME * config.REDIS_DBEXPIRE / 1000, redisClient.print);
                    var name = options.key.split(':')[0].split('@').length > 1 ? options.key.split(':')[0].split('@')[0] : config.NULLNAME;
                    redisClient.hset(config.TABLE_DEVICENAME, key.split(':')[0].toLowerCase(), name, redisClient.print);
                    return;
                });
            }
            redisClient.setrange(options.key.toLowerCase(), index, str, redisClient.print);
            redisClient.hset(config.TABLE_LATESTPOSITION, options.key.split(':')[0].toLowerCase(), str, redisClient.print);
        }
    },


    devices: function (options) {
        var results = [];
        var counts = 0;
        redisClient.hgetall(config.TABLE_LATESTPOSITION, function (err, latestposition) {
            if (err) {
                options.states.error();
                return;
            }
            var maps = {};
            var latestpositions = JSON.parse(JSON.stringify(latestposition));
            for (var key in latestpositions) {
                var position = utility.positionfomat(false, latestpositions[key]);
                maps[key] = position;
            }
            redisClient.hgetall(config.TABLE_DEVICENAME, function (err, obj) {
                if (err) {
                    options.states.error();
                    return;
                }
                var names = JSON.parse(JSON.stringify(obj));
                for (var map in maps) {
                    var result = {};
                    if (names && names[map])
                        result.name = names[map];
                    result.latestPosition = maps[map];
                    result.uniqueId = map;
                    results.push(result);
                }
                options.states.message(results);
            });
        });
    },


    positions: function (options) {
        var id = options.argq.uniqueid;
        if (!id) {
            options.states.error();
            return;
        }
        var results = [];
        var from = parseInt(options.argq.from);
        var to = parseInt(options.argq.to);
        var now = new Date();
        var time = now.getTime();
        var begin;
        var end;

        if (!from) {
            from = time - config.ONEDAYTIME / 24;
            begin = utility.dbstoreindex(from);
        } else {
            if (utility.datespan(from, time) > config.REDIS_DBEXPIRE - 1)
                from = time - (config.REDIS_DBEXPIRE - 1) * config.ONEDAYTIME;
            begin = utility.dbstoreindex(from);
        }

        if (!to) {
            to = time;
            end = utility.dbstoreindex(time);
        } else {
            to = to < time ? to : time;
            end = utility.dbstoreindex(to);
        }

        if (from > to) {
            options.states.message(results);
            return;
        }

        var counts = 0;
        while (from <= to) {
            counts += 1;
            var partend = utility.date(from) === utility.date(to) ? end - 1 : config.REDIS_DBLENGTH - 1;
            redisClient.getrange(id + ':' + utility.date(from), begin, partend, function (err, str) {
                counts -= 1;
                if (err) {
                    options.states.error();
                    return;
                }
                var arr = str.replace(/\x00/g, '').split(';');
                if (arr[0]) {
                    arr.forEach(function (item) {
                        if (item) results.push(utility.positionfomat(false, item));
                    });
                }
                if (counts === 0) options.states.message(results);
            });
            begin = 0;
            from += config.ONEDAYTIME;
        }
    },


    latestpositions: function (options) {
        var results = [];
        var counts = 0;
        redisClient.hgetall(config.TABLE_LATESTPOSITION, function (err, obj) {
            if (err) {
                options.states.error();
                return;
            }
            var maps = {};
            var positions = JSON.parse(JSON.stringify(obj));
            for (var key in positions) {
                var position = utility.positionfomat(key, positions[key]);
                maps[key] = position;
            }
            redisClient.hgetall(config.TABLE_DEVICENAME, function (err, obj) {
                var names = JSON.parse(JSON.stringify(obj));
                for (var name in names) {
                    if (names && maps[name]) {
                        maps[name].device.name = names[name];
                    }
                }
                for (var map in maps) {
                    results.push(maps[map]);
                }
                options.states.message(results);
            });
        });
    },


    adddevice: function (options) {
        var id = options.argq.uniqueid;
        if (!id) {
            options.states.error();
            return;
        }
        var name = require('url').parse(req.url, true).query.name;
        redisClient.hgetall(config.TABLE_LATESTPOSITION, function (err, obj) {
            if (err || (obj && obj[id])) {
                options.states.error();
                return;
            }
            redisClient.hset(config.TABLE_LATESTPOSITION, id, ' ', function (err, reply) {
                if (err) {
                    options.states.error();
                    return;
                }
                if (name)
                    redisClient.hset(config.TABLE_DEVICENAME, id, name, function (err, reply) {
                        if (err) {
                            options.states.error();
                            return;
                        }
                        options.states.ok();
                    });
                else {
                    var pname = id.split('@').length > 1 ? id.split('@')[0] : config.NULLNAME;
                    redisClient.hset(config.TABLE_DEVICENAME, id, name, function (err, reply) {
                        if (err) {
                            options.states.error();
                            return;
                        }
                        options.states.ok();
                    });
                }
                options.states.ok();
            });
        });
    },


    deledevice: function (options) {
        var id = options.argq.uniqueid;
        if (!id) {
            options.states.error();
            return;
        }
        redisClient.hgetall(config.TABLE_LATESTPOSITION, function (err, obj) {
            if (err || !obj || (obj && !obj[id])) {
                options.states.error();
                return;
            }
            redisClient.hdel(config.TABLE_LATESTPOSITION, function (err, reply) {
                if (err) {
                    options.states.error();
                    return;
                }
                options.states.ok();
            });
        });
    },


    updatedevice: function (options) {
        var id = options.argq.uniqueid;
        var name = require('url').parse(options.req.url, true).query.name;
        if (!id || name === undefined) {
            options.states.error();
            return;
        }
        redisClient.hgetall(config.TABLE_LATESTPOSITION, function (err, obj) {
            if (err || !obj || (obj && !obj[id])) {
                options.states.error();
                return;
            }
            redisClient.hset(config.TABLE_DEVICENAME, id, name, function (err, reply) {
                if (err) {
                    options.states.error();
                    return;
                }
                options.states.ok();
            });
        });
    },


    query : function(options){
        options.states.error();
    }
};


exports.create = function () {
    redisClient = redis.createClient();
    return object;
};