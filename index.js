const express = require('express'),
    morgan    = require('morgan'),
    configLib = require('./libraries/config.lib');

const app   = express(),
    baseUrl = '/api/v1';

app.use(morgan('tiny'));
app.use(require('./middlewares')(baseUrl));
app.use(baseUrl, require('./controllers'));
app.use(require('./middlewares/afterware'));


app.listen(+configLib.env.port);
console.log(`Listening on port ${configLib.env.port}!`);
