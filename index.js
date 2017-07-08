'use strict';

var express = require('express');
var wagner = require('wagner-core');

require('./models')();
require('./services')(wagner);

var app = express();
var baseUrl = '/api/v1';

app.use(require('./middlewares')(wagner, baseUrl));
app.use(baseUrl, require('./controllers'));

app.listen(3010);
console.log('Listening on port 3010!');
