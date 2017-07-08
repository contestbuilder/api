'use strict';

var express   = require('express'),
	wagner    = require('wagner-core'),
	configLib = require('./libraries/config.lib');

require('./models')(configLib.env.DATABASE_PATH);
require('./services')(wagner);

var app = express();
var baseUrl = '/api/v1';

app.use(require('./middlewares')(wagner, baseUrl));
app.use(baseUrl, require('./controllers'));

app.listen(3010);
console.log('Listening on port 3010!');
