node-traccar
============

= DESCRIPTION:

An implementation of [Traccar](https://www.traccar.org) for [Nodejs](http://nodejs.org/). This allows you to report location infomation and get query result in json format.

The following db options are supported.

 Option                                       | Description
:---------------------------------------------|:----------------------
mongodb                                       | supported
redis                                         | supported
postgis                                       | todo

= USAGE:

Install:

```
npm install traccar
```

Optionally, you can add NPM packages by creating a packages json object:

```
"dependencies": {
    "traccar": "*"
  }
```

Import package:

```
require('traccar');
```
