DESCRIPTION
============

An implementation of [Traccar](https://www.traccar.org) for [Nodejs](http://nodejs.org/). This allows you to report indoor/outdoor infomation and get query result in json format.

The following db options are supported.

 Option                                       | Description
:---------------------------------------------|:----------------------
mongodb                                       | supported (default)
redis                                         | supported
postgis                                       | todo

USAGE
============

Install:

```
npm install traccar
```

Optionally, you can add NPM packages by creating a json object:

```
"dependencies": {
    "traccar": "*"
  }
```

and then type:

```
npm install
```

Module usage:

```
require('traccar');
```

Alternate database in file 'config.js':

from

```
exports.DEFAULTDB = this.MONGODB;
```
to

```
exports.DEFAULTDB = this.REDIS;
```

Also, it allows users to modify other default values in 'config.js'.

INTERFACE
============

[Traccar Http Interface](https://github.com/goshx/node-traccar/wiki/Interface)
