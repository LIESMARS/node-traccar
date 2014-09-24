DESCRIPTION
============

An implementation of [Traccar](https://www.traccar.org) for [Nodejs](http://nodejs.org/). This allows you to report location infomation and get query result in json format.

The following db options are supported.

 Option                                       | Description
:---------------------------------------------|:----------------------
mongodb                                       | supported
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

Also, it provide permission to allow users to modify default values in file 'config.js'.

INTERFACE
============

wiki: [Traccar Http Interface](https://github.com/goshx/node-traccar/wiki/Interface)
