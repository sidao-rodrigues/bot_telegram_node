const express = require('express');
const AppError = require('../error/appError');
const { stopSchedule, setNewExpressionSchedule } = require('../crontab/crontab');
const router = express.Router();

router.get('/stop', (req, res) => {
  console.log('Stoping crontab...');
  res.set('Content-Type', 'text/html');
  return res.send(Buffer.from('<h2>Stoping crontab...</h2>'));
});

router.get('/start', (req, res) => {
  console.log('Starting crontab...');
  res.set('Content-Type', 'text/html');
  return res.send(Buffer.from('<h2>Starting crontab...</h2>'));
});

router.post('/update-expression', (req, res) => {
  if(!req.body.expression) {
    throw new AppError('Crontab Expression required.<p style="font-size: 20px;">Example: <b>* * * * *</b></p>', 'Bad Request');
  }
  stopSchedule();
  setNewExpressionSchedule(req.body.expression);
  res.set('Content-Type', 'text/html');
  return res.send(Buffer.from('<h2>Crontab Expression sucessfully updated!</h2>'));
});

module.exports = router;