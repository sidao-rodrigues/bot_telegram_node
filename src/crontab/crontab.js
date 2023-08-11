const crontab = require('node-cron');

let job = null;
let crontabExpression = process.env.CRONTAB_EXPRESSION || '* 9,15 * * 1-6';

const initSchedule = () => {
  console.log('init', crontabExpression);
  job = crontab.schedule(crontabExpression, async () => {
    console.log('chamou agora:', (new Date()).toISOString(), 'expression:', crontabExpression);
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
  console.log('New Expression:', expression);
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