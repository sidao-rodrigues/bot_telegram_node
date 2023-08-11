const express = require('express');
const cors = require('cors');
const authResolve = require('../middlewares/auth');
const { errorResolve, resourceNotFound } = require('../middlewares/error');

const app = express();

app.use(cors());
app.use(express.json());

app.use(authResolve);

//routes
app.use('/crontab', require('../routes/crontabRoute'));

app.get('/info', (req, res) => {
  const html = `<h1>Status: success</h1>` + 
  `<p style="font-size: 20px;">Message: API Bot Telegram running...</p>`;
  res.set('Content-Type', 'text/html');
  return res.send(Buffer.from(html));
});

app.use(errorResolve);

app.use(resourceNotFound)

module.exports = { app }