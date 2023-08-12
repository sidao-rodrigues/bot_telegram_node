const crontab = require('node-cron');
const { dailyInfo } = require('../bot/commands');

let job = null;
let crontabExpression = process.env.CRONTAB_EXPRESSION || '* 9,15 * * 1-6';

const initSchedule = () => {
  console.log('Init crontab', crontabExpression);
  job = crontab.schedule(crontabExpression, async () => {
    await dailyInfo();
  });
  startSchedule();
}

const startSchedule = () => {
  console.log('Start job...');
  job?.start();
}

const stopSchedule = () => {
  console.log('Stoped job...');
  job?.stop();
}

const setNewExpressionSchedule = (expression) => {
  stopSchedule();
  crontabExpression = expression;
  initSchedule();
}

module.exports = {
  initSchedule,
  startSchedule,
  stopSchedule,
  setNewExpressionSchedule
}