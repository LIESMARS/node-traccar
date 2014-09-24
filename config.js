/**
 * regexp
 */
exports.REGEXP_IMEI = /^imei,(.*)/i;
exports.REGEXP_GPRMC = /^\$gprmc,(.*)/i;
exports.REGEXP_INDOOR = /^\$indoor,(.*)/i;

/**
 * common table name
 */
exports.TABLE_LATESTPOSITION = 'latestposition';
exports.TABLE_DEVICENAME = 'name';

/**
 * redis
 */
exports.REDIS = 'redis';
exports.REDIS_DBEXPIRE = 10;
exports.REDIS_DBPARTLENGTH = 48;
exports.REDIS_DBLENGTH = 24 * 60 * 60 * this.REDIS_DBPARTLENGTH;

/**
 * mongodb
 */
exports.MONGODB = 'mongodb';
exports.MONGODB_DBNAME = 'position';
exports.MONGODB_HOST = 'localhost';
exports.MONGODB_PORT = 27017;

/**
 * postgis
 */
exports.POSTGIS = 'pg';

/**
 * more
 */
exports.LOCATIONSERVER_PORT = 5005;
exports.QUERYSERVER_PORT = 8082;
exports.INFINIT = 99999999999999999999;
exports.ONEDAYTIME = 24 * 60 * 60 * 1000;
exports.NULLNAME = '未命名';
exports.NULLPOSITION = 'NaNNaN';
exports.IMEISTORE = {};
exports.NAMESTORE = {};

/**
 * default db
 */
exports.DEFAULTDB = this.MONGODB;

