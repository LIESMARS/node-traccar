var debug = console.log;
var config = require('./config');
var utility = require('./utility');
var mongodb = require(config.MONGODB);
var server;
var db;


var object = {

    storeImei: function (callback, options) {
		db.collection(config.TABLE_LATESTPOSITION, function (err, collection) {
			if (err)return options.states.error();
			collection.find({uniqueId: options.key}).toArray(function (err, reply) {
				if (err)return options.states.error();
				if (reply.length > 0) return callback(reply[0].device.name);
			});
		});
	},
	
	
    storePosition: function (callback, options) {
        if (!options.key) return options.states.error();;
        options.key = options.key.split(':')[0];
        var gprmc = options.gprmc[1].split(',');
        if (gprmc[2] !== config.NULLPOSITION && gprmc[4] !== config.NULLPOSITION) {
            var str = utility.dbrecordfomat(gprmc);
            var obj = utility.positionfomat(options.key, str);
            obj.absoluteCoordinate = {type: "Point", coordinates: [obj.longitude, obj.latitude]};
            obj.relativeCoordinate = {type: "Point", coordinates: [obj.x, obj.y]};
            db.collection(options.key, function (err, collection) {
                if (err)return options.states.error();
                collection.insert(obj, {save: true}, function (err, reply) {
                    if (err)return options.states.error();
                    db.collection(config.TABLE_LATESTPOSITION, function (err, collection) {
                        if (err)return options.states.error();
						if (config.NAMESTORE[options.key])
							obj.device.name = config.NAMESTORE[options.key];
						delete obj._id;
                        collection.update({uniqueId: options.key}, {$set: obj}, {upsert: true}, function (err, reply) {
                            if (err)return options.states.error();
							options.states.ok();
                        });
                    });
                });
            });
        }
    },


    devices: function (options) {
        db.collection(config.TABLE_LATESTPOSITION, function (err, collection) {
            collection.find().toArray(function (err, reply) {
                if (err) return options.states.error();
                if (reply.length > 0) {
                    var idx;
                    var obj;
                    var results = [];
                    for (idx = 0; idx < reply.length; idx++) {
                        obj = utility.devicefomat(reply[idx]);
                        if (obj) results.push(obj);
                    }
                    options.states.message(results);
                } else {
                    options.states.error();
                }
            });
        });
    },


    positions: function (options) {
        if (!options.argq.uniqueid) options.states.error();
        var name;
        db.collection(config.TABLE_LATESTPOSITION, function (err, collection) {
            collection.find({uniqueId: options.argq.uniqueid}).toArray(function (err, reply) {
                if (reply.length > 0) name = reply[0].device.name;
                db.collection(options.argq.uniqueid, function (err, collection) {
                    if (err) return options.states.error();
                    if (!options.argq.from) options.argq.from = 0;
                    if (!options.argq.to) options.argq.to = config.INFINIT;
                    collection.find({time: {$gte: Number(options.argq.from), $lte: Number(options.argq.to)}}).toArray(function (err, reply) {
                        if (err) return options.states.error();
                        if (reply.length > 0) {
                            var idx;
                            var obj;
                            var results = [];
                            for (idx = 0; idx < reply.length; idx++) {
                                obj = utility.devicefomat(reply[idx], name);
                                if(obj) results.push(obj);
                            }
                            options.states.message(results);
                        } else {
                            options.states.error();
                        }
                    });
                });
            });
        });
    },


    latestpositions: function (options) {
        db.collection(config.TABLE_LATESTPOSITION, function (err, collection) {
            if (err) return options.states.error();
            collection.find().toArray(function (err, reply) {
                if (err) return options.states.error();
                if (reply.length > 0) {
                    options.states.message(reply);
                } else {
                    options.states.error();
                }
            });
        });
    },


    adddevice: function (options) {
        db.collection(config.TABLE_LATESTPOSITION, function (err, collection) {
            if (err) return options.states.error();
            collection.find({uniqueId: options.argq.uniqueid}).toArray(function (err, reply) {
                if (err) return options.states.error();
                if (reply.length > 0) {
                    return options.states.error();
                } else {
                    var obj = utility.positionfomat(options.argq.uniqueid);
                    if (!options.argq.name) options.argq.name = config.NULLNAME;
                    obj.device.name = options.argq.name;
                    collection.insert(obj, {safe: true}, function (err, reply) {
                        if (err) return options.states.error();
                        options.states.ok();
                    });
                }
            });
        });
    },


    deledevice: function (options) {
        db.collection(config.TABLE_LATESTPOSITION, function (err, collection) {
            if (err) return options.states.error();
            collection.remove({uniqueId: options.argq.uniqueid}, {safe: true}, function () {
            });
        });
        db.collection(options.argq.uniqueid, function (err, collection) {
            if (err) return options.states.error();
            collection.drop(function (err, reply) {
                options.states.ok();
            });
        });
    },


    updatedevice: function (options) {
        if (!options.argq.uniqueid || !options.argq.name) return options.states.error();
        db.collection(config.TABLE_LATESTPOSITION, function (err, collection) {
            if (err) return options.states.error();
            collection.update({uniqueId: options.argq.uniqueid}, {$set: {
                    device: {name: options.argq.name, latestPosition: null, uniqueId: options.argq.uniqueid}}},
                {safe: true}, function (err, reply) {
					config.NAMESTORE[options.argq.uniqueid] = options.argq.name;
                    if (err) return options.states.error();
                    options.states.ok();
                });
        });
    },


    query: function (options) {
	
        try {
			if (!options.argq.cmd) options.argq.cmd = {};
			else options.argq.cmd = eval("(" + options.argq.cmd + ")");
			if (!options.argq.table) options.argq.table = config.TABLE_LATESTPOSITION;
            db.collection(options.argq.table, function (err, collection) {
                collection.find(options.argq.cmd).toArray(function (err, reply) {
                    if (err) return options.states.error();
                    options.states.message(reply);
                });
            });
        }catch(err){
            return options.states.error();
        }
    }
};


exports.create = function () {
    server = new mongodb.Server(config.MONGODB_HOST, config.MONGODB_PORT, {auto_reconnect: true});
    db = new mongodb.Db(config.MONGODB_DBNAME, server, {safe: true});
    db.open(function (err, db) {
        if (err) debug(err);
    });
    return object;
};