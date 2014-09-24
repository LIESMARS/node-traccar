var debug = console.log;

var config = require('./config');
var utility = require('./utility');
var factory = require('./sqlclientfactory');
var NET = require('net');
var HTTP = require('http');

var locationServer = NET.createServer(locationConnectionHandler);
var queryServer = HTTP.createServer(queryConnectionHandler);
var sqlClient = factory.createClient(config.DEFAULTDB);

locationServer.listen(config.LOCATIONSERVER_PORT, function (err) {
    debug('location server listen at: %d', config.LOCATIONSERVER_PORT);
    if (err) throw err;
});

queryServer.listen(config.QUERYSERVER_PORT, function (err) {
    debug('query server listen at: %d', config.QUERYSERVER_PORT);
    if (err) throw err;
});

function locationConnectionHandler(socket) {
	var states = {
        error: function () {
            socket.write('false');
        },
        ok: function () {
            socket.write('ok');
        }
    };
	
    socket.on('error', function (err) {
        debug('problem with socket: ' + err.message);
    });

    socket.on('data', function (data) {
        var record = String(data);
        if (!record) return;
        utility.recorder({
			record: data,
			states: states,
			remoteAddress: socket.remoteAddress,
			sqlClient: sqlClient});
    });
}

function queryConnectionHandler(req, res) {
    var args   = require('url').parse(req.url.toLowerCase(), true);
    var argq   = args.query;
    var states = {
        error: function () {
            res.writeHead(200, {
                'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': '*'
            });
            res.end('false');
        },
        ok: function () {
            res.writeHead(200, {
                'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': '*'
            });
            res.end('ok');
        },
        message: function (obj) {
            res.writeHead(200, {
                'Content-Type': 'application/json;charset=utf-8',
				'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(obj));
        }
    };

    if (req.method === 'POST') {
        req.on('data', function (data) {
            argq = require('querystring').parse(data.toString());
            requestHandler();
        });
    } else if (req.method === 'GET') {
        requestHandler();
    }

    function requestHandler() {
        switch (true) {
            case (/\/devices/i).test(args.pathname):
                sqlClient.devices({
                    states: states,
                    args: args,
                    argq: argq,
                    req: req
                });
                break;
            case (/\/positions/i).test(args.pathname):
                sqlClient.positions({
                    states: states,
                    args: args,
                    argq: argq,
                    req: req
                });
                break;
            case (/\/latestpositions/i).test(args.pathname):
                sqlClient.latestpositions({
                    states: states,
                    args: args,
                    argq: argq,
                    req: req
                });
                break;
            case (/\/adddevice/i).test(args.pathname):
                sqlClient.adddevice({
                    states: states,
                    args: args,
                    argq: argq,
                    req: req
                });
                break;
            case (/\/deledevice/i).test(args.pathname):
                sqlClient.deledevice({
                    states: states,
                    args: args,
                    argq: argq,
                    req: req
                });
                break;
            case (/\/updatedevice/i).test(args.pathname):
                sqlClient.updatedevice({
                    states: states,
                    args: args,
                    argq: argq,
                    req: req
                });
                break;
            case (/\/query/i).test(args.pathname):
                sqlClient.query({
                    states: states,
                    args: args,
                    argq: argq,
                    req: req
                });
                break;
            case (/\/record/i).test(args.pathname):
                var data = argq.data;
                if (!data) return;
                utility.recorder({
					record: data,
					remoteAddress: req.connection.remoteAddress,
					states: states,
					sqlClient: sqlClient});
                break;
            case (/\/crossdomain/i).test(args.pathname):
                require('fs').readFile(require('path').resolve(__dirname, 'public/crossdomain.xml'), 'binary', function (err, file) {
                    res.writeHead(200, {
                        'Content-Type': 'application/xml;charset=utf-8',
						'Access-Control-Allow-Origin': '*'
                    });
                    res.write(file, 'binary');
                    res.end();
                });
                break;
            default:
                states.error();
        }
    }
}