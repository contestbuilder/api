'use strict';

var express   = require('express'),
	wagner    = require('wagner-core'),
	morgan    = require('morgan'),
	configLib = require('./libraries/config.lib');

require('./models')(configLib.env.databasePath);
require('./services')(wagner);

var app = express();
var baseUrl = '/api/v1';

app.use(morgan('tiny'));
app.use(require('./middlewares')(wagner, baseUrl));
app.use(baseUrl, require('./controllers'));

app.listen(+configLib.env.port);
console.log('Listening on port ' + configLib.env.port + '!');
