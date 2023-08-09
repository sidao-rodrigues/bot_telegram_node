const express = require('express');

const app = express();

app.get('/info', (req, res) => {
  return res.json({
    status: 'success',
    message: 'API running'
  });
})

app.use((error, req, res, next) => {
  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    stack: error. message
  });
});

app.use((req, res) => {
  return res.status(404).json({
    status: 'error',
    message: 'resource not found'
  });
})

module.exports = { app }