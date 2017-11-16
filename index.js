const express = require('express'),
    morgan    = require('morgan'),
    configLib = require('./libraries/config.lib');

require('./models');

const app   = express(),
    baseUrl = '/api/v1';

app.use(morgan('tiny'));
app.use(require('./middlewares')(baseUrl));
app.use(baseUrl, require('./controllers'));

app.listen(+configLib.env.port);
console.log(`Listening on port ${configLib.env.port}!`);
