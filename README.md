DESCRIPTION
============

An implementation of [Traccar](https://www.traccar.org) for [Nodejs](http://nodejs.org/). This allows you to report location infomation and get query result in json format.

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

Import package:

```
require('traccar');
```

Alternate database in file 'traccar.js':

from

```
var sqlClient = factory.createClient(config.MONGODB);
```
to

```
var sqlClient = factory.createClient(config.REDIS);
```

Also, it provide permission to allow users to modify default values in file 'config.js'.

INTERFACE
============

[Traccar Http Interface](https://github.com/goshx/node-traccar/wiki/Interface)
