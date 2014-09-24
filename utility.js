var debug = console.log;
var config = require('./config');

exports.date = function date(time) {
    if (!time) return new Date().format('yyyyMMdd');
    else return new Date(parseInt(time)).format('yyyyMMdd');
};

exports.dbstoreindex = function dbstoreindex(time) {
    var now;
    if (!time)
        now = new Date();
    else
        now = new Date(parseInt(time));

    var hh = parseInt(now.format('hh'));
    var mm = parseInt(now.format('mm'));
    var ss = parseInt(now.format('ss'));
    return (hh * 60 * 60 + mm * 60 + ss) * config.REDIS_DBPARTLENGTH;
};

exports.datespan = function datespan(from, to) {
    return (to - to % config.ONEDAYTIME - from + from % config.ONEDAYTIME) / config.ONEDAYTIME;
};

exports.dbrecordfomat = function (gprmc) {
    if(gprmc.length === 12)
        return [new Date().getTime(), gprmc[2], gprmc[4], gprmc[6], gprmc[7]].join(',') + ';';
    else
        return [new Date().getTime(), gprmc[2], gprmc[4], gprmc[6], gprmc[7], gprmc[11], gprmc[12], gprmc[13], gprmc[14]].join(',') + ';';
};

exports.devicefomat = function(positionitem,name) {
    try {
        var device = positionitem.device;
        device.latestPosition = positionitem;
        if (name) device.name = name;
        delete device.latestPosition.device;
        return device;
    }catch(err){
        debug(err);
    }
};

exports.positionfomat = function (id, str) {
    var position = {
        course: 0,
        speed: 0,
        valid: true,
        other: null,
        altitude: 0,
        device: null,
        time: 0,
        longitude: 0,
        latitude: 0,
        x: null,
        y: null,
        z: null,
        room: null,
        building: null
    };

    if (!str) {
        if(id) position.device = {
            latestPosition: null,
            name: config.NULLNAME,
            uniqueId: id
        };
        position.uniqueId = id;
        return position;
    }

    try {
        var arr = str.split(',');
        position.time = Number(arr[0]);
        if (!arr[1] && !arr[2]) return position;
        position.latitude = parseInt(arr[1].slice(0, 2)) + parseFloat(arr[1].slice(2) / 60);
        position.longitude = parseInt(arr[2].slice(0, 3)) + parseFloat(arr[2].slice(3) / 60);
        position.speed = Number(arr[3]);
        position.course = Number(arr[4]);
        position.id = arr[0];
        if(arr.length > 5){
            position.x = Number(arr[5]);
            position.y = Number(arr[6]);
            position.z = Number(arr[7]);
            position.building = arr[8].replace(/;$/gi,"");
        }

        if (!id) return position;
        position.device = {
            latestPosition: null,
            name: config.NULLNAME,
            uniqueId: id
        };
        position.uniqueId = id;
    } catch (err) {
        debug(err);
    }
    return position;
};

exports.recorder = function(options) {
    //debug('[%s]-> %s', remoteAddress, record);
    var imei;
    if (imei = String(options.record).match(config.REGEXP_IMEI)) {
        config.IMEISTORE[options.remoteAddress] = imei[1] + ':' + this.date();
		if(options.states) options.states.ok();
        return options.sqlClient.storeImei(function (reply) {
			if(reply) config.NAMESTORE[imei[1]] = reply;
        }, {
            key: imei[1],
			states: options.states
        });
    }

    var gprmc;
    if (gprmc = String(options.record).match(config.REGEXP_GPRMC)) {
        return options.sqlClient.storePosition(function () {
        }, {
            key: config.IMEISTORE[options.remoteAddress],
            gprmc: gprmc,
			states: options.states
        });
    }
}

Date.prototype.format = function(fmt) {
    var o = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    return fmt;
};